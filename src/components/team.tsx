const members = [
    {
        name: 'Kelvin Hemu',
        role: 'Chief Executive Officer',
        avatar: 'https://res.cloudinary.com/ds4lpuk8p/image/upload/v1763814010/kelvin_qisfex.jpg',
    },
    {
        name: 'Christopher Mtoi',
        role: 'Chief Operating Officer',
        avatar: 'https://res.cloudinary.com/ds4lpuk8p/image/upload/v1763814484/chriss_mbaxu8.png',
    },
    {
        name: 'Thabit Gange',
        role: 'Chief Technology Officer',
        avatar: 'https://res.cloudinary.com/ds4lpuk8p/image/upload/v1768678535/thabeet_qcwgq5.jpg',
    },
    {
        name: 'Happy Winston',
        role: 'Chief Marketing Officer',
        avatar: 'https://res.cloudinary.com/ds4lpuk8p/image/upload/v1763814761/Happy_fat7ph.png',
    },
]

export default function TeamSection() {
    return (
        <section id="team" className="py-12 md:py-32">
            <div className="mx-auto max-w-3xl px-8 lg:px-0">
                <h2 className="mb-8 text-4xl font-bold md:mb-16 lg:text-5xl">Our team</h2>

                <div id="team">
                    <div className="grid grid-cols-2 gap-4 border-t py-6 md:grid-cols-4">
                        {members.map((member, index) => (
                            <div key={index}>
                                <div className="bg-background size-20 rounded-full border p-0.5 shadow shadow-zinc-950/5">
                                    <img className="aspect-square rounded-full object-cover" src={member.avatar} alt={member.name} height="460" width="460" loading="lazy" />
                                </div>
                                <span className="mt-2 block text-sm">{member.name}</span>
                                <span className="text-muted-foreground block text-xs">{member.role}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
