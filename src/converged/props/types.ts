export type Signal = Function
export type Elements = {
    [key: PropertyKey]: any
} //  HTMLElement | Element | Node | EventTarget
export type Handler =
    | Function
    | VoidFunction
    | [VoidFunction | Function, ...any]

// props

export type Props = {
    [key: PropertyKey]: any
}

export type When = Signal | boolean | unknown

export type Each =
    | Signal
    | (() => Each)
    | unknown[]
    | Map<unknown, unknown>
    | Set<unknown>

// components

export type Children = any

export type Component = ((props?: Props) => Children) | Function

export type Componenteable =
    | string
    | Elements
    | object
    | FunctionConstructor
    | Component
    

export type GenericObject<T> = {
    [K in keyof T]: T[K]
}

export type Generic<T> = T


