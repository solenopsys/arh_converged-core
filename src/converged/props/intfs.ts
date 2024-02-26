export interface Elements {
    [key: string]: any;
}
export interface Props{
    [key: string]: any;
}

// ? node.removeAttributeNS(NS[ns], name)
// 			: node.removeAttribute(name);
// 	} else {
// 		ns && NS[ns]
// 			? node.setAttributeNS(NS[ns], name, value)
// 			: node.setAttribute(name, value);