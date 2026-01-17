"use client";
import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import Image from "next/image";

export function ScrollSection() {
    return (
        <div className="flex flex-col overflow-hidden">
            <ContainerScroll
                titleComponent={
                    <>
                        <h1 className="text-4xl font-semibold text-foreground dark:text-white">
                            Manage your business <br />
                            <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">
                                With Ease
                            </span>
                        </h1>
                    </>
                }
            >
                <Image
                    src={`/images/image.png`}
                    alt="hero"
                    height={720}
                    width={1400}
                    className="mx-auto rounded-2xl object-cover h-full object-left-top draggable-false"
                    draggable={false}
                />
            </ContainerScroll>
        </div>
    );
}
