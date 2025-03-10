// Enhanced environment with THREE.js instancing for optimized performance

// Main environment enhancement function
function enhanceEnvironment(scene, loader) {
    console.log("Starting environment enhancement with optimized instancing...");
    
    try {
        // Create instanced trees
        createInstancedForest(scene, loader);
        
        // Create instanced rocks
        createInstancedRocks(scene, loader);
        
        // Create instanced mountains from scaled rocks
        createInstancedMountains(scene, loader);
        
        console.log("Environment enhancement completed successfully with instancing.");
    } catch (error) {
        console.error("Error during environment enhancement:", error);
    }
}

// Create instanced forest using InstancedMesh for optimal performance
function createInstancedForest(scene, loader) {
    console.log("Creating instanced forest boundary...");
    
    // Load tree model once to create template geometry and material
    loader.load('./tree.glb', (gltf) => {
        const treeScene = gltf.scene;
        
        // Extract the first mesh from the tree model to use as template
        let templateMesh = null;
        treeScene.traverse(node => {
            if (node.isMesh && !templateMesh) {
                templateMesh = node;
            }
        });
        
        if (!templateMesh) {
            console.error("No mesh found in tree model!");
            return;
        }
        
        // Use the geometry from the template mesh
        const treeGeometry = templateMesh.geometry;
        
        // Clone and modify the material to ensure it's visible
        const treeMaterial = templateMesh.material.clone();
        treeMaterial.roughness = 0.8;
        treeMaterial.transparent = false;
        treeMaterial.opacity = 1.0;
        treeMaterial.depthWrite = true;
        treeMaterial.depthTest = true;
        treeMaterial.side = THREE.DoubleSide;
        treeMaterial.needsUpdate = true;
        
        // Create instance counts for different tree sizes
        const largeTreeCount = 120;
        const mediumTreeCount = 180;
        const smallTreeCount = 240;
        
        // Create instanced meshes
        const largeTreeInstances = new THREE.InstancedMesh(
            treeGeometry,
            treeMaterial,
            largeTreeCount
        );
        
        const mediumTreeInstances = new THREE.InstancedMesh(
            treeGeometry,
            treeMaterial,
            mediumTreeCount
        );
        
        const smallTreeInstances = new THREE.InstancedMesh(
            treeGeometry,
            treeMaterial,
            smallTreeCount
        );
        
        // Setup shadows for instanced meshes
        largeTreeInstances.castShadow = true;
        largeTreeInstances.receiveShadow = true;
        mediumTreeInstances.castShadow = true;
        mediumTreeInstances.receiveShadow = true;
        smallTreeInstances.castShadow = true;
        smallTreeInstances.receiveShadow = true;
        
        // Create transformation matrices for each instance
        const dummy = new THREE.Object3D();
        const boundaryRadius = 40; // Just outside the playable area
        
        // Place the large trees (outer ring)
        for (let i = 0; i < largeTreeCount; i++) {
            const angle = (i / largeTreeCount) * Math.PI * 2;
            
            // Add some randomness to the radius
            const radius = boundaryRadius + 10 + (Math.random() * 5);
            
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            // Skip areas for path to house
            if (Math.abs(x) < 10 && z > 5) continue;
            
            // Randomize scale and rotation
            const scale = 0.5 + Math.random() * 0.3;
            
            dummy.position.set(x, 0, z);
            dummy.rotation.y = Math.random() * Math.PI * 2;
            dummy.scale.set(scale, scale, scale);
            dummy.updateMatrix();
            
            // Set the matrix for this instance
            largeTreeInstances.setMatrixAt(i, dummy.matrix);
        }
        
        // Place medium trees (middle ring)
        for (let i = 0; i < mediumTreeCount; i++) {
            const angle = (i / mediumTreeCount) * Math.PI * 2;
            
            // Add some randomness to the radius
            const radius = boundaryRadius + (Math.random() * 8 - 4);
            
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            // Skip areas for path to house
            if (Math.abs(x) < 12 && z > 0) continue;
            
            // Randomize scale and rotation
            const scale = 0.4 + Math.random() * 0.2;
            
            dummy.position.set(x, 0, z);
            dummy.rotation.y = Math.random() * Math.PI * 2;
            dummy.scale.set(scale, scale, scale);
            dummy.updateMatrix();
            
            // Set the matrix for this instance
            mediumTreeInstances.setMatrixAt(i, dummy.matrix);
        }
        
        // Place small trees (inner and scattered)
        for (let i = 0; i < smallTreeCount; i++) {
            const angle = (i / smallTreeCount) * Math.PI * 2;
            
            // Add some randomness to the radius
            const radius = boundaryRadius - 5 + (Math.random() * 10 - 5);
            
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            // Skip areas for path, house, and car
            if ((Math.abs(x) < 15 && z > 0) || // Path to house
                (x < -5 && x > -25 && z < -10 && z > -25)) // Car area
                continue;
            
            // Randomize scale and rotation
            const scale = 0.3 + Math.random() * 0.2;
            
            dummy.position.set(x, 0, z);
            dummy.rotation.y = Math.random() * Math.PI * 2;
            dummy.scale.set(scale, scale, scale);
            dummy.updateMatrix();
            
            // Set the matrix for this instance
            smallTreeInstances.setMatrixAt(i, dummy.matrix);
        }
        
        // Update the instance matrices
        largeTreeInstances.instanceMatrix.needsUpdate = true;
        mediumTreeInstances.instanceMatrix.needsUpdate = true;
        smallTreeInstances.instanceMatrix.needsUpdate = true;
        
        // Add instances to the scene
        scene.add(largeTreeInstances);
        scene.add(mediumTreeInstances);
        scene.add(smallTreeInstances);
        
        console.log(`Created instanced forest with ${largeTreeCount + mediumTreeCount + smallTreeCount} trees`);
    }, 
    (xhr) => {
        console.log(`Tree model for instancing ${(xhr.loaded / xhr.total * 100).toFixed(0)}% loaded`);
    }, 
    (error) => {
        console.error('Error loading tree model for instancing:', error);
    });
}

// Create instanced rocks using InstancedMesh for optimal performance
function createInstancedRocks(scene, loader) {
    console.log("Creating instanced rock boundary...");
    
    // Load rock model once to create template geometry and material
    loader.load('./rocks.glb', (gltf) => {
        const rockScene = gltf.scene;
        
        // Extract the first mesh from the rock model to use as template
        let templateMesh = null;
        rockScene.traverse(node => {
            if (node.isMesh && !templateMesh) {
                templateMesh = node;
            }
        });
        
        if (!templateMesh) {
            console.error("No mesh found in rock model!");
            return;
        }
        
        // Use the geometry from the template mesh
        const rockGeometry = templateMesh.geometry;
        
        // Clone and modify the material to ensure it's visible
        const rockMaterial = templateMesh.material.clone();
        rockMaterial.roughness = 0.9;
        rockMaterial.metalness = 0.1;
        rockMaterial.transparent = false;
        rockMaterial.opacity = 1.0;
        rockMaterial.depthWrite = true;
        rockMaterial.depthTest = true;
        rockMaterial.side = THREE.DoubleSide;
        rockMaterial.needsUpdate = true;
        
        // Create instance counts for different rock sizes and placements
        const largeRockCount = 60;
        const mediumRockCount = 100;
        const smallRockCount = 150;
        
        // Create instanced meshes
        const largeRockInstances = new THREE.InstancedMesh(
            rockGeometry,
            rockMaterial,
            largeRockCount
        );
        
        const mediumRockInstances = new THREE.InstancedMesh(
            rockGeometry,
            rockMaterial,
            mediumRockCount
        );
        
        const smallRockInstances = new THREE.InstancedMesh(
            rockGeometry,
            rockMaterial,
            smallRockCount
        );
        
        // Setup shadows for instanced meshes
        largeRockInstances.castShadow = true;
        largeRockInstances.receiveShadow = true;
        mediumRockInstances.castShadow = true;
        mediumRockInstances.receiveShadow = true;
        smallRockInstances.castShadow = true;
        smallRockInstances.receiveShadow = true;
        
        // Create transformation matrices for each instance
        const dummy = new THREE.Object3D();
        const rockRadius = 55; // Outside the tree boundary
        
        // Place large rocks (outer boundary)
        for (let i = 0; i < largeRockCount; i++) {
            const angle = (i / largeRockCount) * Math.PI * 2;
            
            // Add some randomness to the radius
            const radius = rockRadius + (Math.random() * 8 - 4);
            
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            // Skip a portion to allow for the path to the house
            if (Math.abs(x) < 12 && z > 0) continue;
            
            // Randomize scale and rotation
            const scaleX = 1.0 + Math.random() * 0.6;
            const scaleY = scaleX * (0.8 + Math.random() * 0.4);
            const scaleZ = scaleX;
            
            // Partially bury the rocks
            const yPos = -scaleY * 0.3;
            
            dummy.position.set(x, yPos, z);
            dummy.rotation.set(
                (Math.random() - 0.5) * 0.2,
                Math.random() * Math.PI * 2,
                (Math.random() - 0.5) * 0.2
            );
            dummy.scale.set(scaleX, scaleY, scaleZ);
            dummy.updateMatrix();
            
            // Set the matrix for this instance
            largeRockInstances.setMatrixAt(i, dummy.matrix);
        }
        
        // Place medium rocks (scattered between trees and boundary)
        for (let i = 0; i < mediumRockCount; i++) {
            const angle = (i / mediumRockCount) * Math.PI * 2;
            
            // More randomized positions between the tree line and rock boundary
            const radius = 45 + (Math.random() * 15 - 7.5);
            
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            // Skip areas for path, house, and car
            if ((Math.abs(x) < 15 && z > 0) || // Path to house
                (x < -5 && x > -25 && z < -10 && z > -25)) // Car area
                continue;
            
            // Randomize scale and rotation
            const scaleX = 0.7 + Math.random() * 0.4;
            const scaleY = scaleX * (0.8 + Math.random() * 0.4);
            const scaleZ = scaleX;
            
            // Partially bury the rocks
            const yPos = -scaleY * 0.2;
            
            dummy.position.set(x, yPos, z);
            dummy.rotation.set(
                (Math.random() - 0.5) * 0.3,
                Math.random() * Math.PI * 2,
                (Math.random() - 0.5) * 0.3
            );
            dummy.scale.set(scaleX, scaleY, scaleZ);
            dummy.updateMatrix();
            
            // Set the matrix for this instance
            mediumRockInstances.setMatrixAt(i, dummy.matrix);
        }
        
        // Place small rocks (scattered throughout playable area)
        for (let i = 0; i < smallRockCount; i++) {
            // Completely random positions throughout the playable area
            const radius = Math.random() * 35;
            const angle = Math.random() * Math.PI * 2;
            
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            // Skip areas for path, house, car and character start position
            if ((Math.abs(x) < 6 && z > -5) || // Path to house
                (x < -5 && x > -25 && z < -10 && z > -25) || // Car area
                (x > -2 && x < 2 && z > -2 && z < 2)) // Character start
                continue;
            
            // Randomize scale and rotation - smaller rocks
            const scaleX = 0.3 + Math.random() * 0.3;
            const scaleY = scaleX * (0.8 + Math.random() * 0.4);
            const scaleZ = scaleX;
            
            // Partially bury the rocks
            const yPos = -scaleY * 0.2;
            
            dummy.position.set(x, yPos, z);
            dummy.rotation.set(
                (Math.random() - 0.5) * 0.5,
                Math.random() * Math.PI * 2,
                (Math.random() - 0.5) * 0.5
            );
            dummy.scale.set(scaleX, scaleY, scaleZ);
            dummy.updateMatrix();
            
            // Set the matrix for this instance
            smallRockInstances.setMatrixAt(i, dummy.matrix);
        }
        
        // Update the instance matrices
        largeRockInstances.instanceMatrix.needsUpdate = true;
        mediumRockInstances.instanceMatrix.needsUpdate = true;
        smallRockInstances.instanceMatrix.needsUpdate = true;
        
        // Add instances to the scene
        scene.add(largeRockInstances);
        scene.add(mediumRockInstances);
        scene.add(smallRockInstances);
        
        console.log(`Created instanced rocks with ${largeRockCount + mediumRockCount + smallRockCount} rocks`);
    }, 
    (xhr) => {
        console.log(`Rock model for instancing ${(xhr.loaded / xhr.total * 100).toFixed(0)}% loaded`);
    }, 
    (error) => {
        console.error('Error loading rock model for instancing:', error);
    });
}

// Create mountain barrier using instanced, scaled rock models
function createInstancedMountains(scene, loader) {
    console.log("Creating instanced mountain boundary from scaled rocks...");
    
    // Load rock model once to create template geometry and material
    loader.load('./rocks.glb', (gltf) => {
        const rockScene = gltf.scene;
        
        // Extract the first mesh from the rock model to use as template
        let templateMesh = null;
        rockScene.traverse(node => {
            if (node.isMesh && !templateMesh) {
                templateMesh = node;
            }
        });
        
        if (!templateMesh) {
            console.error("No mesh found in rock model for mountains!");
            return;
        }
        
        // Use the geometry from the template mesh
        const mountainGeometry = templateMesh.geometry;
        
        // Clone and modify the material for mountains
        const mountainMaterial = templateMesh.material.clone();
        mountainMaterial.roughness = 0.9;
        mountainMaterial.metalness = 0.2;
        mountainMaterial.transparent = false;
        mountainMaterial.opacity = 1.0;
        mountainMaterial.depthWrite = true;
        mountainMaterial.depthTest = true;
        mountainMaterial.side = THREE.DoubleSide;
        mountainMaterial.needsUpdate = true;
        
        // Create instance count
        const mountainCount = 15; // Fewer, larger mountains
        
        // Create instanced mesh
        const mountainInstances = new THREE.InstancedMesh(
            mountainGeometry,
            mountainMaterial,
            mountainCount
        );
        
        // Setup shadows
        mountainInstances.castShadow = true;
        mountainInstances.receiveShadow = true;
        
        // Create transformation matrices for each instance
        const dummy = new THREE.Object3D();
        const barrierRadius = 65; // Outside the rock boundary
        
        // Place mountains in a circular formation
        for (let i = 0; i < mountainCount; i++) {
            const angle = (i / mountainCount) * Math.PI * 2;
            
            // Skip a portion to create an entrance/exit
            if (i === Math.floor(mountainCount * 0.75)) continue;
            
            // Add some randomness to the radius
            const radius = barrierRadius + (Math.random() * 5 - 2.5);
            
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            // Massive scale for mountains
            const baseScale = 8.0 + Math.random() * 4.0;
            const scaleX = baseScale * (0.8 + Math.random() * 0.4);
            const scaleY = baseScale * (1.0 + Math.random() * 0.6);
            const scaleZ = baseScale * (0.8 + Math.random() * 0.4);
            
            // Partially bury the mountains
            const yPos = -scaleY * 0.5;
            
            dummy.position.set(x, yPos, z);
            dummy.rotation.set(
                (Math.random() - 0.5) * 0.2,
                Math.random() * Math.PI * 2,
                (Math.random() - 0.5) * 0.2
            );
            dummy.scale.set(scaleX, scaleY, scaleZ);
            dummy.updateMatrix();
            
            // Set the matrix for this instance
            mountainInstances.setMatrixAt(i, dummy.matrix);
        }
        
        // Update the instance matrix
        mountainInstances.instanceMatrix.needsUpdate = true;
        
        // Add instance to the scene
        scene.add(mountainInstances);
        
        console.log(`Created instanced mountains with ${mountainCount} large mountains`);
    }, 
    (xhr) => {
        console.log(`Rock model for mountains ${(xhr.loaded / xhr.total * 100).toFixed(0)}% loaded`);
    }, 
    (error) => {
        console.error('Error loading rock model for mountains:', error);
    });
} 