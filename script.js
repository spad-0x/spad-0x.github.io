/* 
    Premium Portfolio JS Logic
    Handles Custom GeoJSON 3D Earth, Lenis smooth scrolling, GSAP advanced animations, and text decoding.
*/

document.addEventListener("DOMContentLoaded", () => {

    // 1. Removed custom scroll interceptors (Restoring native scrolling CSS)


    // 2. Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");
    const mobileLinks = document.querySelectorAll(".mobile-link");

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener("click", () => {
            const isClosed = mobileMenu.classList.contains("opacity-0");
            if (isClosed) {
                mobileMenu.classList.remove("opacity-0", "-translate-y-4", "pointer-events-none");
                mobileMenu.classList.add("opacity-100", "translate-y-0", "pointer-events-auto");
            } else {
                mobileMenu.classList.add("opacity-0", "-translate-y-4", "pointer-events-none");
                mobileMenu.classList.remove("opacity-100", "translate-y-0", "pointer-events-auto");
            }
        });

        mobileLinks.forEach(link => {
            link.addEventListener("click", () => {
                mobileMenu.classList.add("opacity-0", "-translate-y-4", "pointer-events-none");
                mobileMenu.classList.remove("opacity-100", "translate-y-0", "pointer-events-auto");
            });
        });
    }

    // 3. PGP Key Popover Toggle
    const pgpBtn = document.getElementById("pgp-btn");
    const pgpPopover = document.getElementById("pgp-popover");

    if (pgpBtn && pgpPopover) {
        pgpBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // prevent document click from firing immediately
            const isClosed = pgpPopover.classList.contains("opacity-0");
            if (isClosed) {
                pgpPopover.classList.remove("opacity-0", "translate-y-2", "pointer-events-none");
                pgpPopover.classList.add("opacity-100", "translate-y-0", "pointer-events-auto");
                pgpBtn.firstElementChild.classList.add("text-accentTeal");
            } else {
                pgpPopover.classList.add("opacity-0", "translate-y-2", "pointer-events-none");
                pgpPopover.classList.remove("opacity-100", "translate-y-0", "pointer-events-auto");
                pgpBtn.firstElementChild.classList.remove("text-accentTeal");
            }
        });

        // Click outside to close
        document.addEventListener("click", (e) => {
            if (!pgpPopover.contains(e.target) && !pgpPopover.classList.contains("opacity-0")) {
                pgpPopover.classList.add("opacity-0", "translate-y-2", "pointer-events-none");
                pgpPopover.classList.remove("opacity-100", "translate-y-0", "pointer-events-auto");
                pgpBtn.firstElementChild.classList.remove("text-accentTeal");
            }
        });
    }

    // 4. Decode Hover Effect (Fast Numeric Scramble)
    const numbers = "01010101";
    const decodeElements = document.querySelectorAll(".decode-text");

    decodeElements.forEach(el => {
        el.addEventListener("mouseenter", event => {
            let iterations = 0;
            const targetText = event.target.dataset.value;

            clearInterval(el.interval);

            el.interval = setInterval(() => {
                event.target.innerText = targetText.split("")
                    .map((letter, index) => {
                        if (index < iterations) {
                            return targetText[index];
                        }
                        return numbers[Math.floor(Math.random() * numbers.length)];
                    })
                    .join("");

                if (iterations >= targetText.length) {
                    clearInterval(el.interval);
                }

                iterations += 1;
            }, 20);
        });
    });

    // 5. Decode Hover Effect Slow (For Navbar)
    const decodeElementsSlow = document.querySelectorAll(".decode-text-slow");

    decodeElementsSlow.forEach(el => {
        el.addEventListener("mouseenter", event => {
            let iterations = 0;
            const targetText = event.target.dataset.value;

            clearInterval(el.interval);

            el.interval = setInterval(() => {
                event.target.innerText = targetText.split("")
                    .map((letter, index) => {
                        if (index < iterations) {
                            return targetText[index];
                        }
                        return numbers[Math.floor(Math.random() * numbers.length)];
                    })
                    .join("");

                if (iterations >= targetText.length) {
                    clearInterval(el.interval);
                }

                iterations += 1;
            }, 50); // Slower interval
        });
    });

    // 4. Custom Three.js GeoJSON Globe Setup
    let scene, camera, renderer, globeContainer;
    let arcLines = [];
    const canvas = document.getElementById('webgl-canvas');

    if (canvas && typeof THREE !== 'undefined' && typeof GeoJsonGeometry !== 'undefined') {
        initEarthGlobe();
        animateEarthGlobe();
    }

    function latLongToVector3(lat, lng, radius) {
        const phi = (90 - lat) * (Math.PI / 180);
        // Correct spherical projection to match standard GeoJSON wrap
        const theta = (-lng + 90) * (Math.PI / 180);

        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        return new THREE.Vector3(x, y, z);
    }

    function initEarthGlobe() {
        // Scene setup
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x030712, 0.001);

        // Camera setup
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.z = 450;
        camera.position.y = 50;

        // Renderer setup
        renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Create Container
        globeContainer = new THREE.Group();
        globeContainer.rotation.x = Math.PI / 8; // Tilt the earth slightly
        globeContainer.rotation.y = -Math.PI / 1.5; // Start the globe facing Europe directly!

        // Dark occluding sphere inner core to block see-through lines but keep a holographic ghost feel
        const innerSphere = new THREE.Mesh(
            new THREE.SphereGeometry(99.0, 64, 64),
            new THREE.MeshBasicMaterial({
                color: 0x030b14, // Ultra dark navy/black ocean
                transparent: false,
                opacity: 1 // Holographic transparency
            })
        );
        globeContainer.add(innerSphere);

        // Solid States Layer (Glowing Additive Shader Mask)
        const landSphere = new THREE.Mesh(
            new THREE.SphereGeometry(99.5, 64, 64),
            new THREE.ShaderMaterial({
                uniforms: {
                    uTexture: { value: null },
                    uColor: { value: new THREE.Color(0x10b981) } // The emerald palette color
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform sampler2D uTexture;
                    uniform vec3 uColor;
                    varying vec2 vUv;
                    void main() {
                        vec4 texColor = texture2D(uTexture, vUv);
                        // Topology maps: land is white/grey (>0), ocean is black (0)
                        float mask = texColor.r; 
                        
                        // Discard oceans entirely to let the innerSphere show through
                        if (mask < 0.05) discard;
                        
                        // Render land as glowing emerald with slight alpha fading based on topology height
                        gl_FragColor = vec4(uColor * (0.5 + mask*0.5), mask * 0.9);
                    }
                `,
                transparent: true,
                blending: THREE.AdditiveBlending // Extreme cyber glow aesthetic
            })
        );

        const textureLoader = new THREE.TextureLoader();
        textureLoader.load('./datasets/earth-dark.jpg', (texture) => {
            landSphere.material.uniforms.uTexture.value = texture;
            landSphere.rotation.y = -Math.PI / 2; // Align texture perfectly with GeoJSON prime meridian
        });

        globeContainer.add(landSphere);

        // Fetch GeoJSON and Render Wireframe (Landmass only)
        fetch('./datasets/ne_110m_land.geojson')
            .then(res => res.json())
            .then(land => {
                const wireframeMaterial = new THREE.LineBasicMaterial({
                    color: 0x10b981,
                    transparent: true,
                    opacity: 0.4
                });

                land.features.forEach(feature => {
                    const geometry = new GeoJsonGeometry(feature.geometry, 100);
                    const lineSegments = new THREE.LineSegments(geometry, wireframeMaterial);
                    globeContainer.add(lineSegments);
                });
            })
            .catch(err => console.error("Could not load GeoJSON map: ", err));

        // Define Major Cities Coordinates
        const cities = [
            { lat: 40.7128, lng: -74.0060 },    // NYC
            { lat: 51.5074, lng: -0.1278 },     // London
            { lat: 35.6762, lng: 139.6503 },    // Tokyo
            { lat: 55.7558, lng: 37.6173 },     // Moscow
            { lat: 59.9343, lng: 30.3351 },     // Saint Petersburg
            { lat: 60.0000, lng: 30.3167 },     // Novosibirsk
            { lat: 55.0369, lng: 82.9105 },     // Yekaterinburg
            { lat: 53.2299, lng: 50.1626 },     // Kazan
            { lat: 51.5287, lng: 46.0353 },     // Chelyabinsk
            { lat: 55.7669, lng: 37.6219 },     // Perm
            { lat: 39.9042, lng: 116.4074 },    // Beijing
            { lat: 50.1109, lng: 8.6821 },      // Frankfurt
            { lat: -23.5505, lng: -46.6333 },   // Sao Paulo
            { lat: -33.8688, lng: 151.2093 },   // Sydney
            { lat: 25.2048, lng: 55.2708 },     // Dubai
            { lat: 1.3521, lng: 103.8198 },     // Singapore
            { lat: 48.8566, lng: 2.3522 },      // Paris
            { lat: 43.2965, lng: 5.3697 },      // Marseille
            { lat: 50.4501, lng: 30.5234 },     // Kyiv
            { lat: 31.2304, lng: 121.4737 },    // Shanghai
            { lat: 41.8781, lng: -87.6298 },    // Chicago
            { lat: 34.0522, lng: -118.2437 },   // Los Angeles
            { lat: 28.6139, lng: 77.2090 },     // New Delhi
            { lat: 22.5431, lng: 114.0579 },    // Shenzhen
            { lat: 30.0444, lng: 31.2357 },     // Cairo
            { lat: 19.4326, lng: -99.1332 },    // Mexico City
            { lat: 19.0760, lng: 72.8777 },     // Mumbai
            { lat: 41.0082, lng: 28.9784 },     // Istanbul
            { lat: 13.7563, lng: 100.5018 },    // Bangkok
            { lat: 37.5665, lng: 126.9780 },    // Seoul
            { lat: -34.6037, lng: -58.3816 },   // Buenos Aires
            { lat: 21.3072, lng: -157.8581 },   // Honolulu
            { lat: 6.5244, lng: 3.3792 },       // Lagos
            { lat: -6.2088, lng: 106.8456 },    // Jakarta
            { lat: 34.6575, lng: -1.6572 },     // Beirut
            { lat: 52.5200, lng: 13.4050 },     // Berlin
            { lat: 41.9028, lng: 12.4964 },     // Rome
            { lat: -33.9249, lng: 18.4241 },    // Cape Town
            { lat: 22.3193, lng: 114.1694 },    // Hong Kong
            { lat: 40.4168, lng: -3.7038 },     // Madrid
            { lat: 40.8466, lng: 14.2522 },     // Naples
            { lat: 45.4642, lng: 9.1895 },      // Milan
            { lat: 41.3851, lng: 2.1734 },      // Barcelona
            { lat: 64.1353, lng: -21.8952 },    // Reykjavik
            { lat: 59.9139, lng: 10.7522 },     // Oslo
            { lat: 59.3293, lng: 18.0686 },     // Stockholm
            { lat: 35.6895, lng: 51.3894 },     // Tehran
            { lat: 34.5055, lng: 69.1750 },     // Khabul
            { lat: 31.7686, lng: 35.2162 },     // Jerusalem
            { lat: 38.8951, lng: -77.0364 },    // Washington D.C.
            { lat: 32.0853, lng: 34.7818 },     // Tel Aviv
            { lat: 52.3676, lng: 4.9041 },      // Amsterdam
            { lat: 12.9716, lng: 77.5946 },     // Bangalore
            { lat: 14.5995, lng: 120.9842 },    // Manila
            { lat: 47.6062, lng: 122.3321 },    // Seattle
            { lat: 31.6299, lng: -7.9831 },     // Marrakech
            { lat: 43.6532, lng: -79.3832 },    // Toronto
            { lat: 24.6290, lng: 46.6772 },     // Riyadh
            { lat: 32.7555, lng: -97.3307 },    // Fort Worth
            { lat: 29.7604, lng: -95.3698 },    // Houston
            { lat: 33.7490, lng: -84.3880 },    // Atlanta
            { lat: 33.4484, lng: -112.0740 },   // Phoenix
            { lat: 37.7749, lng: -122.4194 },   // San Francisco
            { lat: 39.7392, lng: -104.9903 },   // Denver
            { lat: 45.5236, lng: -122.6750 },   // Portland
            { lat: 43.6130, lng: -116.2300 },   // Boise

        ];

        // Draw City Nodes
        const pointGeo = new THREE.SphereGeometry(0.7, 8, 8);
        const pointMat = new THREE.MeshBasicMaterial({ color: 0x14b8a6 });

        cities.forEach(city => {
            const pos = latLongToVector3(city.lat, city.lng, 100);
            const dot = new THREE.Mesh(pointGeo, pointMat);
            dot.position.copy(pos);
            globeContainer.add(dot);
        });

        // Generate Custom Bezier Attack Arcs
        for (let i = 0; i < 150; i++) {
            const start = cities[Math.floor(Math.random() * cities.length)];
            let end = cities[Math.floor(Math.random() * cities.length)];
            while (end === start) end = cities[Math.floor(Math.random() * cities.length)];

            const startVec = latLongToVector3(start.lat, start.lng, 100);
            const endVec = latLongToVector3(end.lat, end.lng, 100);

            const distance = startVec.distanceTo(endVec);

            // Midpoint pushed out based on distance to curve naturally
            const midPoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);

            // Elevate the control point altitude slightly (cyber look)
            const controlPoint = midPoint.normalize().multiplyScalar(100 + (distance * 0.25));

            const curve = new THREE.QuadraticBezierCurve3(startVec, controlPoint, endVec);
            const points = curve.getPoints(300); // 301 vertices for perfectly granular curve rendering
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            geometry.setDrawRange(0, 0); // start fully hidden

            const isGreen = Math.random() > 0.5;

            const material = new THREE.LineBasicMaterial({
                color: isGreen ? 0x10b981 : 0x14b8a6,
                transparent: true,
                opacity: 0.8
            });

            const arcLine = new THREE.Line(geometry, material);

            // Speed must be >= 1.0 to ensure currentPoint increments cross integer boundary EVERY frame (60FPS smoothness)
            arcLine.userData = {
                currentPoint: Math.random() * -100, // Stagger flight origins
                speed: 1.0 + Math.random() * 1.5,   // Moves 1-2.5 vertices per frame reliably
                trailLength: 25 + Math.random() * 20 // Long visible tail spanning 30+ vertices
            };

            globeContainer.add(arcLine);
            arcLines.push(arcLine);
        }

        // Add soft lighting to hit the inner core
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        scene.add(globeContainer);

        window.addEventListener('resize', onWindowResize);

        // Initialization explicit size
        onWindowResize();
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);

        if (globeContainer) {
            if (window.innerWidth < 768) {
                globeContainer.position.set(0, -150, -50);
                globeContainer.scale.set(1.4, 1.4, 1.4);
            } else {
                globeContainer.position.set(200, -20, 0);
                globeContainer.scale.set(2.4, 2.4, 2.4);
            }
        }
    }

    function animateEarthGlobe() {
        requestAnimationFrame(animateEarthGlobe);

        if (globeContainer) {
            // General globe slow spin
            globeContainer.rotation.y += 0.002;

            // Ensure scale stays strictly uniform (protect against any external resizing bugs)
            if (window.innerWidth >= 768) {
                globeContainer.scale.set(2.4, 2.4, 2.4);
            } else {
                globeContainer.scale.set(1.4, 1.4, 1.4);
            }
        }

        // Animate attacks shooting as glowing beams exactly every frame
        arcLines.forEach(arc => {
            arc.userData.currentPoint += arc.userData.speed;

            const current = Math.floor(arc.userData.currentPoint);
            const trail = Math.floor(arc.userData.trailLength);

            if (current > 300 + trail) {
                // Restart packet from beginning
                arc.userData.currentPoint = -trail;
            }

            if (current > 0) {
                const startNode = Math.max(0, current - trail);
                const endNode = Math.min(301, current); // Maximum vertex count is 301
                arc.geometry.setDrawRange(startNode, Math.max(0, endNode - startNode));
            } else {
                arc.geometry.setDrawRange(0, 0); // hide entirely when < 0
            }
        });

        renderer.render(scene, camera);
    }

});
