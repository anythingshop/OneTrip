// Enhanced grass instancing for optimized performance

// Function to create optimized grass instances - 10x more dense
function createOptimizedGrass(scene, loader, grassModels) {
    console.log("Creating optimized instanced grass...");
    
    // Process each grass model type
    grassModels.forEach(model => {
        if (model.name.includes('Grass')) {
            console.log(`Processing grass model: ${model.name}`);
            
            // Load the grass model
            loader.load(model.file, (gltf) => {
                const grassScene = gltf.scene;
                
                // Use original position and scale from model definition
                const originalPosition = new THREE.Vector3(...model.position);
                const originalScale = model.scale;
                const originalRotation = model.rotationY || 0;
                
                // Place original model in the scene
                grassScene.position.copy(originalPosition);
                grassScene.scale.set(originalScale, originalScale, originalScale);
                grassScene.rotation.y = originalRotation;
                scene.add(grassScene);
                
                // Extract first mesh to use as template for instancing
                let templateMesh = null;
                grassScene.traverse(node => {
                    if (node.isMesh && !templateMesh) {
                        templateMesh = node;
                    }
                });
                
                if (!templateMesh) {
                    console.error(`No mesh found in grass model: ${model.name}`);
                    return;
                }
                
                // Create optimized instanced version of this grass
                createOptimizedGrassInstances(scene, templateMesh, model.file, originalScale);
                
            }, 
            (xhr) => {
                console.log(`Grass model ${model.name} ${(xhr.loaded / xhr.total * 100).toFixed(0)}% loaded`);
            }, 
            (error) => {
                console.error(`Error loading grass model ${model.name}:`, error);
            });
        }
    });
}

// Create optimized instanced grass - 10x more dense
function createOptimizedGrassInstances(scene, templateMesh, modelFile, baseScale) {
    console.log(`Creating optimized instanced grass using ${modelFile}...`);
    
    // Get geometry from template
    const templateGeometry = templateMesh.geometry.clone();
    
    // Clone and optimize material
    const templateMaterial = templateMesh.material.clone();
    
    // Make sure material is properly configured for visibility
    templateMaterial.transparent = false;
    templateMaterial.opacity = 1.0;
    templateMaterial.depthWrite = true;
    templateMaterial.depthTest = true;
    templateMaterial.side = THREE.DoubleSide;
    templateMaterial.needsUpdate = true;
    
    // 10x increased counts based on grass type
    const count = modelFile.includes('large') ? 1500 :
                  modelFile.includes('medium') ? 2500 : 3500;
    
    // Create instanced mesh
    const grassInstances = new THREE.InstancedMesh(
        templateGeometry,
        templateMaterial,
        count
    );
    
    // Setup shadows
    grassInstances.castShadow = true;
    grassInstances.receiveShadow = true;
    
    // Create transformation matrices for each instance
    const dummy = new THREE.Object3D();
    
    // Create clustered distribution for natural look
    const numClusters = 12;
    const clusterCenters = [];
    
    // Generate cluster centers
    for (let i = 0; i < numClusters; i++) {
        // Distribute clusters within the playable area
        const radius = 5 + Math.random() * 25; // Keep within ~30 units of center
        const angle = Math.random() * Math.PI * 2;
        
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        // Skip areas for path, house, car, and character start
        if ((Math.abs(x) < 6 && z > -5) || // Path to house
            (x < -5 && x > -25 && z < -10 && z > -25) || // Car area
            (x > -2 && x < 2 && z > -2 && z < 2)) // Character start
            continue;
        
        clusterCenters.push({ x, z });
    }
    
    // Size factors based on grass type
    const scaleFactor = modelFile.includes('large') ? 1.7 :
                        modelFile.includes('medium') ? 1.4 : 1.2;
    
    // Place grass instances
    for (let i = 0; i < count; i++) {
        let x, z;
        
        if (i < count * 0.8) {
            // 80% of grass in clusters
            const clusterIndex = Math.floor(Math.random() * clusterCenters.length);
            const cluster = clusterCenters[clusterIndex];
            
            // Distance from cluster center, using gaussian-like distribution
            const distance = Math.pow(Math.random(), 2) * 8; // More dense toward center
            const angle = Math.random() * Math.PI * 2;
            
            x = cluster.x + Math.cos(angle) * distance;
            z = cluster.z + Math.sin(angle) * distance;
        } else {
            // 20% completely random for fill
            const radius = Math.random() * 35;
            const angle = Math.random() * Math.PI * 2;
            
            x = Math.cos(angle) * radius;
            z = Math.sin(angle) * radius;
            
            // Skip areas for path, house, car, and character start
            if ((Math.abs(x) < 6 && z > -5) || // Path to house
                (x < -5 && x > -25 && z < -10 && z > -25) || // Car area
                (x > -2 && x < 2 && z > -2 && z < 2)) // Character start
                continue;
        }
        
        // Randomize scale around the base scale factor
        const scale = (baseScale * scaleFactor) * (0.7 + Math.random() * 0.6);
        
        dummy.position.set(x, 0, z);
        dummy.rotation.y = Math.random() * Math.PI * 2;
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        
        // Set the matrix for this instance
        grassInstances.setMatrixAt(i, dummy.matrix);
    }
    
    // Update the instance matrix
    grassInstances.instanceMatrix.needsUpdate = true;
    
    // Add instance to the scene
    scene.add(grassInstances);
    
    console.log(`Created ${count} instanced grass objects using ${modelFile}`);
} 