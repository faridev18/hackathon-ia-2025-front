import React from 'react';


export default function Fieldcard({ icon, title, description }) {
    return (
        <div>
            <div className="relative">
                <div
                    className="group relative cursor-pointer overflow-hidden bg-white px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:mx-auto sm:max-w-sm sm:rounded-lg sm:px-6 min-h-[300px]">
                    <span className="absolute top-10 z-0 h-20 w-20 rounded-full bg-green-600 transition-all duration-300 group-hover:scale-[20]"></span>
                    <div className="relative z-10 mx-auto max-w-md">
                        <span className="grid h-20 w-20 place-items-center rounded-full bg-green-600 transition-all duration-300 group-hover:bg-green-600">
                            {icon}
                        </span>
                        <div className="space-y-4 pt-5 text-base leading-7 text-gray-600 transition-all duration-300 group-hover:text-white/90">
                            <h4 className=' text-xl font-title font-bold break-word'>{title}</h4>
                            <p className='break-word text-lg'>
                                {description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
