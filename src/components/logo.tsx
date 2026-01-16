import Image from 'next/image'

export function Logo() {
    return (
        <div className="flex items-center gap-2">
            <Image
                src="/Vestis.svg"
                alt="Vestis"
                width={24}
                height={24}
                className="h-6 w-6"
            />
            <span className="text-xl font-semibold">Vestis</span>
        </div>
    )
}
