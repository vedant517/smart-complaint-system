import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface SLATimerProps {
    dueDate: string | Date;
    status: string;
}

const SLATimer = ({ dueDate, status }: SLATimerProps) => {
    const [timeLeft, setTimeLeft] = useState<string>("");
    const [colorClass, setColorClass] = useState<string>("text-success");

    useEffect(() => {
        if (!dueDate || status === "RESOLVED") {
            setTimeLeft(status === "RESOLVED" ? "Completed" : "N/A");
            setColorClass("text-muted-foreground");
            return;
        }

        const calculateTime = () => {
            const target = new Date(dueDate).getTime();
            const now = new Date().getTime();
            const diff = target - now;

            if (diff <= 0) {
                setTimeLeft("Breached");
                setColorClass("text-destructive animate-pulse font-bold");
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);

            // Color logic: < 24h = yellow, else green
            if (hours < 24) {
                setColorClass("text-warning font-semibold");
            } else {
                setColorClass("text-success");
            }
        };

        calculateTime();
        const interval = setInterval(calculateTime, 1000);

        return () => clearInterval(interval);
    }, [dueDate, status]);

    return (
        <div className={`flex items-center gap-1.5 text-xs tabular-nums ${colorClass}`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{timeLeft}</span>
        </div>
    );
};

export default SLATimer;
