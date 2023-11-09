/**
 * Funksjoner og variabler knyttett til kollisjonsdeteksjon.
 *
 */

//Finner world-posisjonene til de to meshene.
//Beregner summen av radiussen til boundingspheren til begge meshene.
//Dersom summen avstanden mellom de to meshene er mindre enn summen av radiusene returneres true, dvs. kollisjon mellom boundingspherene.
//NB! Denne m�ten � gj�re kollisjonsdeteksjon er ikke optimal for store mesh!
import * as THREE from "three";

export function coarseCollisionTest(_mesh1, _collidableMeshList) {
	let _mesh2 = undefined;

	for (let modelIndex = 0; modelIndex < _collidableMeshList.length; modelIndex++) {
		_mesh2 = _collidableMeshList[modelIndex];

		let mesh1Position = new THREE.Vector3();
		mesh1Position.setFromMatrixPosition( _mesh1.matrixWorld );	//Henter posisjonsvektoren fra world-matrisa.

		let mesh2Position = new THREE.Vector3();
		mesh2Position.setFromMatrixPosition( _mesh2.matrixWorld );	//Henter posisjonsvektoren fra world-matrisa.

		let distanceVector = mesh1Position.sub(mesh2Position);		//Finnver vektoren mellom posisjonene.
		let distance = distanceVector.length();						//Beregner lengden p� vektoren.
		let r1plussr2 = _mesh1.geometry.boundingSphere.radius + _mesh2.geometry.boundingSphere.radius;	//Beregner summen av radiusene.
		if (distance < r1plussr2) 									//Sjekker!
			return true;
	}
	return false;
}

//Baert p�: http://stackoverflow.com/questions/11473755/how-to-detect-collision-in-three-js
//Se referert lenke, koden er derfra:
export function fineCollisionTest(_mesh, _collidableMeshList) {
	//Kollisjonsvariabler:
	let directionVector;
	let ray;
	let collisionResults;
	let globalVertex = new THREE.Vector3();

	const positions = _mesh.geometry.attributes.position;
	//Gjennomløper alle vertekser til meshet:
	for (let vertexIndex = 0; vertexIndex < positions.count; vertexIndex++)
	{
		globalVertex.fromBufferAttribute( positions, vertexIndex );
		globalVertex.applyMatrix4( _mesh.matrixWorld );

		//Lager en RAY fra meshets posisjon (globale koordinater) til transformert verteks:
		let meshPosition = new THREE.Vector3();
		meshPosition.setFromMatrixPosition( _mesh.matrixWorld );	//Henter posisjonsvektoren fra world-matrisa.
		directionVector = globalVertex.sub( meshPosition );

		//Lager et Raycaster-objekt vha.
		ray = new THREE.Raycaster( meshPosition, directionVector.clone().normalize() ); //fra, retning

		//Returnerer en liste med objekter som _mesh kolliderer med (n�rmeste f�rst):
		collisionResults = ray.intersectObjects( _collidableMeshList );

		//Dersom denne rayen treffer noen av modellene og
		if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() )
			return true;
	}
	return false;
}
