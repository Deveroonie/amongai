import { useState } from "react";

export default function Modal({trigger, content}) {
    const [open,setOpen] = useState(false);
    return (
        <>
            <span onClick={() => setOpen(!open)}>{trigger}</span>
            {open && (
                <div 
                    className="fixed inset-0 z-9999 flex items-center justify-center"
                    onClick={() => setOpen(false)}
                >
                    <div 
                        className="bg-slate-800 p-4 border-2 rounded-xl"
                        onClick={e => e.stopPropagation()}
                    >
                        {content}
                    </div>
                </div>
            )}
        </>
    );
}