import {  Componenteable, Props } from "../props/types";
import { Component } from "../renderer/component";
 
 
/**
 * Creates components dynamically
 */
export default (props: { component: Componenteable; } & Props): any => {
	// `component` needs to be deleted else it will end in the tag as an attribute
	const { component, ...restProps } = props;
	return Component(component, restProps);
};
