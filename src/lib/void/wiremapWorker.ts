/**
 * WebGL Wiremap Web Worker
 * Renders wiremap animation using Three.js in OffscreenCanvas
 */

import * as THREE from 'three'

interface WiremapNode {
  position: THREE.Vector3
  velocity: THREE.Vector3
  target: THREE.Vector3
  originalPosition: THREE.Vector3
}

interface WiremapConfig {
  nodeCount: number
  nodeColor: string
  lineColor: string
  rippleColor: string
  mousePosition?: { x: number; y: number }
  clickPosition?: { x: number; y: number; time: number }
  width: number
  height: number
}

interface WorkerMessage {
  type: 'init' | 'update' | 'mouse' | 'click' | 'theme'
  config?: WiremapConfig
  theme?: { node: string; line: string; ripple: string }
  mouse?: { x: number; y: number }
  click?: { x: number; y: number }
}

class WiremapRenderer {
  private scene!: THREE.Scene
  private camera!: THREE.PerspectiveCamera
  private renderer!: THREE.WebGLRenderer
  private nodes: WiremapNode[] = []
  private nodeMeshes: THREE.Mesh[] = []
  private lineSegments: THREE.Line[] = []
  private mousePosition = new THREE.Vector2(0, 0)
  private clickRipples: Array<{ position: THREE.Vector2; time: number; wave: number }> = []
  private frameTimeHistory: number[] = []
  private isThrottled = false
  private lastFrameTime = 0
  private animationFrameId?: number

  private config: WiremapConfig = {
    nodeCount: 80,
    nodeColor: '#4A90E2',
    lineColor: '#2E5C8A',
    rippleColor: '#6B9BD2',
    width: 1920,
    height: 1080,
  }

  constructor(private canvas: OffscreenCanvas) {
    this.init()
  }

  private init() {
    // Scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x000000)
    this.scene.background.alpha = 0

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.config.width / this.config.height,
      0.1,
      1000
    )
    this.camera.position.z = 5

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    this.renderer.setSize(this.config.width, this.config.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Create nodes
    this.createNodes()
  }

  private createNodes() {
    this.nodes = []
    this.nodeMeshes = []
    this.lineSegments = []

    const geometry = new THREE.SphereGeometry(0.02, 8, 8)
    const lineMaterial = new THREE.LineBasicMaterial({
      color: this.config.lineColor,
      transparent: true,
      opacity: 0.3,
    })

    for (let i = 0; i < this.config.nodeCount; i++) {
      // Random position in 3D space
      const x = (Math.random() - 0.5) * 10
      const y = (Math.random() - 0.5) * 10
      const z = (Math.random() - 0.5) * 5

      const position = new THREE.Vector3(x, y, z)
      const originalPosition = position.clone()

      const node: WiremapNode = {
        position: position.clone(),
        velocity: new THREE.Vector3(0, 0, 0),
        target: originalPosition.clone(),
        originalPosition,
      }

      this.nodes.push(node)

      // Create mesh for node
      const material = new THREE.MeshBasicMaterial({
        color: this.config.nodeColor,
        transparent: true,
        opacity: 0.8,
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.copy(position)
      this.scene.add(mesh)
      this.nodeMeshes.push(mesh)
    }

    // Create connections between nearby nodes
    this.createConnections(lineMaterial)
  }

  private createConnections(material: THREE.LineBasicMaterial) {
    const maxDistance = 2.5

    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const distance = this.nodes[i].position.distanceTo(this.nodes[j].position)
        if (distance < maxDistance) {
          const geometry = new THREE.BufferGeometry().setFromPoints([
            this.nodes[i].position,
            this.nodes[j].position,
          ])
          const line = new THREE.Line(geometry, material)
          this.scene.add(line)
          this.lineSegments.push(line)
        }
      }
    }
  }

  private updateNodes(deltaTime: number) {
    const mouseAttractRadius = 200 / 100 // Convert pixels to 3D space
    const attractStrength = 0.5
    const damping = 0.95
    const springStrength = 0.02

    // Convert mouse position to 3D space
    const mouse3D = new THREE.Vector3(
      (this.mousePosition.x / this.config.width) * 10 - 5,
      -(this.mousePosition.y / this.config.height) * 10 + 5,
      0
    )

    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i]
      const mesh = this.nodeMeshes[i]

      // Mouse attraction
      const distanceToMouse = node.position.distanceTo(mouse3D)
      if (distanceToMouse < mouseAttractRadius && this.mousePosition.length() > 0) {
        const direction = new THREE.Vector3()
          .subVectors(mouse3D, node.position)
          .normalize()
        const force = direction.multiplyScalar(attractStrength * (1 - distanceToMouse / mouseAttractRadius))
        node.velocity.add(force)
      }

      // Spring back to original position
      const springForce = new THREE.Vector3()
        .subVectors(node.originalPosition, node.position)
        .multiplyScalar(springStrength)
      node.velocity.add(springForce)

      // Apply damping
      node.velocity.multiplyScalar(damping)

      // Update position
      node.position.add(node.velocity.clone().multiplyScalar(deltaTime * 0.1))

      // Update mesh position
      mesh.position.copy(node.position)
    }

    // Update line segments
    let lineIndex = 0
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const distance = this.nodes[i].position.distanceTo(this.nodes[j].position)
        const maxDistance = 2.5

        if (lineIndex < this.lineSegments.length) {
          const line = this.lineSegments[lineIndex]
          if (distance < maxDistance) {
            line.visible = true
            const geometry = line.geometry as THREE.BufferGeometry
            geometry.setFromPoints([
              this.nodes[i].position,
              this.nodes[j].position,
            ])
            geometry.attributes.position.needsUpdate = true
          } else {
            line.visible = false
          }
          lineIndex++
        }
      }
    }
  }

  private updateRipples(deltaTime: number) {
    const rippleSpeed = 2
    const rippleDecay = 0.95

    for (let i = this.clickRipples.length - 1; i >= 0; i--) {
      const ripple = this.clickRipples[i]
      ripple.time += deltaTime * rippleSpeed

      if (ripple.time > 3) {
        // Remove ripple after 3 waves
        this.clickRipples.splice(i, 1)
        continue
      }

      // Create visual ripple effect (simplified - would need additional geometry)
      ripple.wave = Math.sin(ripple.time * Math.PI) * rippleDecay
    }
  }

  private animate = (timestamp: number) => {
    const deltaTime = Math.min((timestamp - this.lastFrameTime) / 1000, 0.1)
    this.lastFrameTime = timestamp

    // FPS monitoring
    const frameTime = deltaTime * 1000
    this.frameTimeHistory.push(frameTime)
    if (this.frameTimeHistory.length > 180) {
      this.frameTimeHistory.shift()
    }

    const avgFrameTime = this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length
    const shouldThrottle = avgFrameTime > 8.33 && this.frameTimeHistory.length > 60

    if (shouldThrottle !== this.isThrottled) {
      this.isThrottled = shouldThrottle
    }

    // Update nodes
    this.updateNodes(deltaTime)

    // Update ripples
    this.updateRipples(deltaTime)

    // Render
    this.renderer.render(this.scene, this.camera)

    // Schedule next frame (throttle to 60fps if needed)
    if (!this.isThrottled) {
      this.animationFrameId = requestAnimationFrame(this.animate)
    } else {
      // Throttle: skip every other frame
      setTimeout(() => {
        this.animationFrameId = requestAnimationFrame(this.animate)
      }, 16) // ~60fps
    }
  }

  public start() {
    this.lastFrameTime = performance.now()
    this.animationFrameId = requestAnimationFrame(this.animate)
  }

  public stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }
  }

  public updateConfig(config: Partial<WiremapConfig>) {
    this.config = { ...this.config, ...config }
    
    if (config.width && config.height) {
      this.camera.aspect = config.width / config.height
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(config.width, config.height)
    }

    if (config.nodeColor) {
      this.nodeMeshes.forEach(mesh => {
        (mesh.material as THREE.MeshBasicMaterial).color.set(config.nodeColor!)
      })
    }

    if (config.lineColor) {
      this.lineSegments.forEach(line => {
        (line.material as THREE.LineBasicMaterial).color.set(config.lineColor!)
      })
    }
  }

  public setMousePosition(x: number, y: number) {
    this.mousePosition.set(x, y)
  }

  public addClickRipple(x: number, y: number) {
    // Add 3 waves
    for (let wave = 0; wave < 3; wave++) {
      this.clickRipples.push({
        position: new THREE.Vector2(x, y),
        time: wave * 0.3, // Stagger waves
        wave,
      })
    }
  }
}

// Web Worker entry point
let renderer: WiremapRenderer | null = null

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, config, theme, mouse, click } = event.data

  switch (type) {
    case 'init':
      if (config && event.data.config) {
        const canvas = event.data.config as unknown as OffscreenCanvas
        if (canvas && canvas instanceof OffscreenCanvas) {
          renderer = new WiremapRenderer(canvas)
          renderer.start()
        }
      }
      break

    case 'update':
      if (config && renderer) {
        renderer.updateConfig(config)
      }
      break

    case 'theme':
      if (theme && renderer) {
        renderer.updateConfig({
          nodeColor: theme.node,
          lineColor: theme.line,
          rippleColor: theme.ripple,
        })
      }
      break

    case 'mouse':
      if (mouse && renderer) {
        renderer.setMousePosition(mouse.x, mouse.y)
      }
      break

    case 'click':
      if (click && renderer) {
        renderer.addClickRipple(click.x, click.y)
      }
      break
  }
}
