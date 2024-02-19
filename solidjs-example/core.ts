import {
    createComponent, mergeProps
} from "./render/index"
import { getOwner, createRoot, createRenderEffect, createMemo, untrack } from "./reactive/signal"

const sharedConfig:{context?:any,registry?:any, done?:any,events?:any,completed?:any} = {}


 
export {
    getOwner,
    createComponent,
    createRoot as root,
    createRenderEffect as effect,
    createMemo as memo,
    sharedConfig,
    untrack,
    mergeProps
};