"use client";

import type { ReactNode, Ref } from "react";
import { Switch as AriaSwitch, type SwitchProps as AriaSwitchProps } from "react-aria-components";
import { cx } from "@/utils/cx";

interface ToggleProps extends Omit<AriaSwitchProps, "children"> {
    size?: "sm" | "md";
    label?: ReactNode;
    hint?: ReactNode;
    ref?: Ref<HTMLLabelElement>;
}

export const Toggle = ({ label, hint, size = "sm", className, ...props }: ToggleProps) => {
    const sizes = {
        sm: { track: "h-5 w-9", thumb: "size-4", translate: "group-selected:translate-x-4" },
        md: { track: "h-6 w-11", thumb: "size-5", translate: "group-selected:translate-x-5" },
    };

    return (
        <AriaSwitch
            {...props}
            className={(state) =>
                cx(
                    "group flex items-start gap-3",
                    state.isDisabled && "cursor-not-allowed opacity-50",
                    !state.isDisabled && "cursor-pointer",
                    typeof className === "function" ? className(state) : className,
                )
            }
        >
            <div
                className={cx(
                    "relative shrink-0 rounded-full bg-tertiary transition-colors duration-150 ease-linear group-selected:bg-brand-solid",
                    "outline-offset-2 group-focus-visible:outline-2 group-focus-visible:outline-focus-ring",
                    sizes[size].track,
                )}
            >
                <div
                    className={cx(
                        "absolute top-0.5 left-0.5 rounded-full bg-fg-white shadow-xs transition-transform duration-150 ease-linear",
                        sizes[size].thumb,
                        sizes[size].translate,
                    )}
                />
            </div>

            {(label || hint) && (
                <div className="flex flex-col gap-0.5">
                    {label && <span className="text-sm font-medium text-secondary">{label}</span>}
                    {hint && <span className="text-sm text-tertiary">{hint}</span>}
                </div>
            )}
        </AriaSwitch>
    );
};

Toggle.displayName = "Toggle";
