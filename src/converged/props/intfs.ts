export interface Elements{
    style:any
    removeAttributeNS:any
    removeAttribute:any
    setAttributeNS:any
    addEventListener:any
    removeEventListener:any
    classList:any
    setAttribute:any
    localName:any
} 

export interface Props{
    
}

// ? node.removeAttributeNS(NS[ns], name)
// 			: node.removeAttribute(name);
// 	} else {
// 		ns && NS[ns]
// 			? node.setAttributeNS(NS[ns], name, value)
// 			: node.setAttribute(name, value);