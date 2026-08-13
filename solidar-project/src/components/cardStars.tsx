interface CardStarsProps {
    numeroEstrelas: number;
}

export default function CardStars({ numeroEstrelas }: CardStarsProps) {
    return (
        <div className="flex absolute top-[-10px] left-3 bg-[#f1f1f1] p-1 rounded-lg">
            {Array.from({ length: 5 }).map((_, index) => (
                <span
                    key={index}
                    className={`material-icons  ${index < numeroEstrelas?'text-yellow-600':'text-gray-400'}`}
                >
                    star
                </span>
            ))}
        </div>
    );
}