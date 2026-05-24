export default function BackgroundEffects() {
  return (
    <>
      <div
        className="orb"
        style={{
          width: '300px',
          height: '300px',
          background: 'rgba(184,115,51,0.06)',
          top: '10%',
          left: '-5%',
          '--d': '25s',
          '--dx': '30px',
          '--dy': '20px',
        }}
      />
      <div
        className="orb"
        style={{
          width: '250px',
          height: '250px',
          background: 'rgba(100,130,160,0.08)',
          top: '40%',
          right: '-5%',
          '--d': '20s',
          '--dx': '-25px',
          '--dy': '30px',
        }}
      />
      <div
        className="orb"
        style={{
          width: '200px',
          height: '200px',
          background: 'rgba(130,160,130,0.06)',
          bottom: '15%',
          left: '20%',
          '--d': '18s',
          '--dx': '20px',
          '--dy': '-20px',
        }}
      />
      <div className="bg-mandala" />
      <div className="bg-mandala" />
      <div className="bg-mandala" />
    </>
  )
}
