export default function TestTherapistsPage() {
  const therapists = [
    {
      id: "therapist-1",
      name: "Dra. Ana Silva",
      bio: "Psicóloga clínica especializada em TCC",
    },
    {
      id: "therapist-2",
      name: "Dr. Carlos Santos",
      bio: "Psicanalista com experiência em terapia familiar",
    }
  ]

  return (
    <div>
      <h1>Test Therapists</h1>
      <div>
        {therapists.map((therapist: any) => (
          <div key={therapist.id}>
            <h3>{therapist.name}</h3>
            <p>{therapist.bio}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
