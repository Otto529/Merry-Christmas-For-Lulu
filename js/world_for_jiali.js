import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// 小许，你就是小刘的全世界
let jialisWorld, myEyes, lovePainter, composer, glowEffect;
let treeOfLoveParams, spiritRedParams, spiritBlueParams;
let guidingStar, loveSpiritRed, loveSpiritBlue;
let isLoveBlooming = false; 
let isTreeRevealed = false; 
let startLoveTime = 0;

// 想和小许永远在一起
export function createRomanticWorld() {
    
    jialisWorld = new THREE.Scene();
    jialisWorld.fog = new THREE.FogExp2(0x0f2027, 0.005);

    myEyes = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    myEyes.position.set(0, 30, 100);

    lovePainter = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    lovePainter.setSize(window.innerWidth, window.innerHeight);
    lovePainter.setPixelRatio(window.devicePixelRatio);
    lovePainter.toneMapping = THREE.CineonToneMapping;
    document.body.appendChild(lovePainter.domElement);

    const obsession = new OrbitControls(myEyes, lovePainter.domElement);
    obsession.enableDamping = true;
    obsession.maxPolarAngle = Math.PI / 2 - 0.05;
    obsession.target.set(0, 25, 0);

   
    buildFoundation();
    plantTreeOfLove();     
    summonLoveSpirits();   
    letMissesFall();       

    
    const renderScene = new RenderPass(jialisWorld, myEyes);
    glowEffect = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    glowEffect.threshold = 0;
    glowEffect.strength = 1.5;
    glowEffect.radius = 0.5;
    
    composer = new EffectComposer(lovePainter);
    composer.addPass(renderScene);
    composer.addPass(glowEffect);

  
    window.addEventListener('resize', onWindowResize);

    
    animateLove();
}


export function bloomLoveForJiali() {
    isLoveBlooming = true;
    startLoveTime = performance.now();
}

// --- 内部创造函数 ---

function buildFoundation() {
    const ground = new THREE.Mesh(new THREE.CircleGeometry(120, 64), new THREE.MeshStandardMaterial({ color: 0x1b331b, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2;
    jialisWorld.add(ground);
    
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 5, 14, 16), new THREE.MeshStandardMaterial({ color: 0x4a3c31 }));
    trunk.position.y = 7;
    jialisWorld.add(trunk);

    jialisWorld.add(new THREE.AmbientLight(0xffffff, 0.1));
    const sunForJiali = new THREE.DirectionalLight(0xffffff, 1);
    sunForJiali.position.set(20, 50, 20);
    jialisWorld.add(sunForJiali);
}

function plantTreeOfLove() {
   
    const dressTexture = (() => {
        const c = document.createElement('canvas'); c.width=64; c.height=64;
        const x = c.getContext('2d');
        x.fillStyle='#1a4d1a'; x.beginPath();
        x.moveTo(32,0); x.quadraticCurveTo(64,32,32,64); x.quadraticCurveTo(0,32,32,0); x.fill();
        return new THREE.CanvasTexture(c);
    })();
    const sparkleTexture = (() => {
        const c = document.createElement('canvas'); c.width=32; c.height=32;
        const x = c.getContext('2d');
        const g = x.createRadialGradient(16,16,0,16,16,16);
        g.addColorStop(0,'rgba(255,255,255,1)');
        g.addColorStop(1,'rgba(0,0,0,0)');
        x.fillStyle=g; x.fillRect(0,0,32,32);
        return new THREE.CanvasTexture(c);
    })();

  
    treeOfLoveParams = { uLoveBloom: { value: 0.0 }, uTime: { value: 0.0 } };
    
    const vertexShader = `
        uniform float uLoveBloom; uniform float uTime;
        attribute float size; attribute vec3 customColor;
        varying vec3 vColor;
        void main() {
            vColor = customColor;
            vec3 pos = position;
            // 爱意生长逻辑
            float growFactor = smoothstep(0.0, 1.0, uLoveBloom * 1.5 - (pos.y - 10.0) / 40.0);
            growFactor = clamp(growFactor, 0.0, 1.0);
            float finalSize = size * growFactor;
            if(uLoveBloom > 0.9) finalSize *= (0.9 + 0.2 * sin(uTime * 3.0 + pos.x));
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = finalSize * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
        }
    `;
    const fragmentShader = `
        uniform sampler2D pointTexture; varying vec3 vColor;
        void main() {
            if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.5) discard;
            gl_FragColor = vec4(vColor, 1.0);
            gl_FragColor = gl_FragColor * texture2D(pointTexture, gl_PointCoord);
        }
    `;

  
    const memoryPos = [], memoryCols = [], memorySizes = [];
    const surprisePos = [], surpriseCols = [], surpriseSizes = [];
    const deepLove = new THREE.Color(0x0f3b0f), freshLove = new THREE.Color(0x2d6a2d);
    
   
    const layers = 36, height = 40, width = 22, startY = 12;

    for(let l=0; l<layers; l++) {
        const t = l / (layers-1);
        const yLevel = startY + t * height;
        const rLevel = width * (1 - t) + 1.0;
        const count = Math.floor(10000 * Math.pow((1 - t), 0.8)) + 600;

        for(let i=0; i<count; i++) {
            const ang = Math.random() * Math.PI * 2;
            const r = rLevel * Math.sqrt(Math.random());
            const x = Math.cos(ang) * r, z = Math.sin(ang) * r;
            const y = yLevel - (r/width)*6 + (Math.random()-0.5);

            if (Math.sqrt(Math.random()) > 0.85 && Math.random() > 0.97) {
                surprisePos.push(x, y, z);
                const rnd = Math.random();
                let col = new THREE.Color();
                if(rnd>0.5) col.setHex(0xffaa00); else if(rnd>0.2) col.setHex(0xff0000); else col.setHex(0x00ccff);
                surpriseCols.push(col.r, col.g, col.b);
                surpriseSizes.push(Math.random() > 0.5 ? 1.5 : 1.0);
            } else {
                memoryPos.push(x, y, z);
                const mix = deepLove.clone().lerp(freshLove, Math.random());
                memoryCols.push(mix.r, mix.g, mix.b);
                memorySizes.push(1.0 + Math.random() * 0.5);
            }
        }
    }

    const leafMat = new THREE.ShaderMaterial({
        uniforms: { ...treeOfLoveParams, pointTexture: { value: dressTexture } },
        vertexShader: vertexShader, fragmentShader: fragmentShader,
        transparent: true, depthWrite: false, blending: THREE.NormalBlending
    });
    const lightMat = new THREE.ShaderMaterial({
        uniforms: { ...treeOfLoveParams, pointTexture: { value: sparkleTexture } },
        vertexShader: vertexShader.replace('gl_PointSize = finalSize', 'gl_PointSize = finalSize * 1.5'),
        fragmentShader: fragmentShader,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });

    const leafGeo = new THREE.BufferGeometry();
    leafGeo.setAttribute('position', new THREE.Float32BufferAttribute(memoryPos, 3));
    leafGeo.setAttribute('customColor', new THREE.Float32BufferAttribute(memoryCols, 3));
    leafGeo.setAttribute('size', new THREE.Float32BufferAttribute(memorySizes, 1));
    
    const lightGeo = new THREE.BufferGeometry();
    lightGeo.setAttribute('position', new THREE.Float32BufferAttribute(surprisePos, 3));
    lightGeo.setAttribute('customColor', new THREE.Float32BufferAttribute(surpriseCols, 3));
    lightGeo.setAttribute('size', new THREE.Float32BufferAttribute(surpriseSizes, 1));

    jialisWorld.add(new THREE.Points(leafGeo, leafMat));
    jialisWorld.add(new THREE.Points(lightGeo, lightMat));

 
    guidingStar = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.5, 0),
        new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 2, roughness: 0.2 })
    );
    guidingStar.position.y = startY + height + 2; 
    guidingStar.scale.set(0,0,0);
    jialisWorld.add(guidingStar);
}

function summonLoveSpirits() {
   
    function createLovePath(radiusBase, height, turns, isClockwise, phaseOffset) {
        const points = []; const steps = 200;
        for(let i=0; i<=steps; i++) {
            const t = i / steps;
            const angle = t * Math.PI * 2 * turns * (isClockwise ? 1 : -1) + phaseOffset;
            const r = radiusBase * (1 - t) + 1.0;
            points.push(new THREE.Vector3(Math.cos(angle)*r, 8+t*(height+4), Math.sin(angle)*r));
        }
        return new THREE.CatmullRomCurve3(points);
    }

    const spiritVS = `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
    const spiritFS = `
        uniform float uChaseProgress; uniform vec3 uPassionColor; varying vec2 vUv;
        void main() {
            if (vUv.x > uChaseProgress) discard;
            float core = pow(1.0 - abs(vUv.y - 0.5) * 2.0, 2.0);
            // 龙头高亮
            float headGlow = (1.0 - smoothstep(0.0, 0.05, uChaseProgress - vUv.x)) * 10.0;
            float tailFade = smoothstep(0.0, 0.5, vUv.x / uChaseProgress);
            gl_FragColor = vec4(uPassionColor * (core + 0.5) * tailFade + vec3(1.0)*headGlow, 1.0);
        }
    `;


    spiritRedParams = { uChaseProgress: { value: 0.0 }, uPassionColor: { value: new THREE.Color(0xff0000) } };
    spiritBlueParams = { uChaseProgress: { value: 0.0 }, uPassionColor: { value: new THREE.Color(0x0088ff) } };

    const matRed = new THREE.ShaderMaterial({ uniforms: spiritRedParams, vertexShader: spiritVS, fragmentShader: spiritFS, transparent: true, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    const matBlue = new THREE.ShaderMaterial({ uniforms: spiritBlueParams, vertexShader: spiritVS, fragmentShader: spiritFS, transparent: true, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });

    
    loveSpiritRed = new THREE.Mesh(new THREE.TubeGeometry(createLovePath(25, 40, 3.5, true, 0), 200, 0.6, 8, false), matRed);
    loveSpiritBlue = new THREE.Mesh(new THREE.TubeGeometry(createLovePath(25, 40, 3.5, false, Math.PI), 200, 0.6, 8, false), matBlue);
    jialisWorld.add(loveSpiritRed); jialisWorld.add(loveSpiritBlue);
}

let fallingMisses, missVelocity;
function letMissesFall() {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(2000 * 3); 
    missVelocity = [];
    for(let i=0; i<2000; i++) {
        pos[i*3] = (Math.random()-0.5)*120; pos[i*3+1] = Math.random()*80; pos[i*3+2] = (Math.random()-0.5)*120;
        missVelocity.push({y: 0.05+Math.random()*0.1, x: (Math.random()-0.5)*0.05});
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    fallingMisses = new THREE.Points(geo, new THREE.PointsMaterial({color: 0xffffff, size: 0.4, transparent: true, opacity: 0.6}));
    jialisWorld.add(fallingMisses);
}

function onWindowResize() {
    myEyes.aspect = window.innerWidth / window.innerHeight;
    myEyes.updateProjectionMatrix();
    lovePainter.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}


function animateLove() {
    requestAnimationFrame(animateLove);
    
    
    treeOfLoveParams.uTime.value = performance.now() / 1000;

    
    const p = fallingMisses.geometry.attributes.position.array;
    for(let i=0; i<2000; i++) {
        p[i*3+1] -= missVelocity[i].y; p[i*3] += missVelocity[i].x;
        if(p[i*3+1] < 0) p[i*3+1] = 80;
    }
    fallingMisses.geometry.attributes.position.needsUpdate = true;

  
    if (isLoveBlooming && !isTreeRevealed) {
        
        let pursuit = (performance.now() - startLoveTime) / 2500;
        if (pursuit > 1.2) pursuit = 1.2;
        
        spiritRedParams.uChaseProgress.value = pursuit;
        spiritBlueParams.uChaseProgress.value = pursuit;

        
        if (pursuit >= 1.0 && !isTreeRevealed) {
            isTreeRevealed = true;
            
            
            let val = 0;
            const revealTimer = setInterval(() => {
                val += 0.02; treeOfLoveParams.uLoveBloom.value = val;
                if (val >= 1.0) clearInterval(revealTimer);
            }, 16);

           
            let strength = 5.0; 
            glowEffect.strength = strength;
            const flashTimer = setInterval(() => {
                strength -= 0.1; glowEffect.strength = strength;
                if (strength <= 1.5) { glowEffect.strength = 1.5; clearInterval(flashTimer); }
            }, 30);

            
            guidingStar.scale.set(1,1,1);
            loveSpiritRed.visible = false; 
            loveSpiritBlue.visible = false;
            document.getElementById('luluText').classList.add('visible');
        }
    }
// 让小刘的爱永远在小许的世界里～

    guidingStar.rotation.y += 0.02;
    composer.render();
}