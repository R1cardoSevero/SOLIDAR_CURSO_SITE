import Topography from './Topography';

interface ParallaxProps {
    tituloParallax: string;
}

export default function Parallax({ tituloParallax }: ParallaxProps) {
    return <section className="bg-fixed bg-center bg-cover bg-no-repeat h-[80vh] relative">
        <h1 className='absolute top-1/2 left-1/2 font-minhafonte text-[14vw] bg-primary-color text-secondary-color transform -translate-x-1/2 -translate-y-1/2 leading-none px-10'>{tituloParallax}</h1>
        <div style={{ width: '100%', height: '80vh', position: 'relative' }}>
            <Topography
                lowColor="#424c1f"
                midColor="#77911d"
                highColor="#FFFFFF"
                speed={0.35}
                morphAmount={3}
                morphSpeed={0.05}
                bands={2}
                thickness={0.01}
                scale={2}
                pixelSize={1}
                glow={0.5}
                className='-z-1'
                colorMode="elevation"
                contrast={3}
                brightness={1}
                fillBands={false}
                opacity={1}
                grain
                grainIntensity={0.05}
                mouseInteraction
                mouseRadius={0.3}
                mouseStrength={0.4}
            />
        </div>
    </section>
}