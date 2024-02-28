 
import { resolve } from '../renderer/manipulate';
import { memo } from '../solid'

import { getValue,  makeCallback,isNullUndefined } from '../uitls/utils.js'


interface SwitchProps {
  children?: any;
  fallback?: any;
}

interface MatchProps {
  when: any;
  children: any;
}

/**
 * Renders the first child that matches the given `when` condition, or
 * a fallback in case of no match
 *
 * @param {SwitchProps} props
 * @returns {any}
 * @url https://pota.quack.uy/Components/Switch
 */
export function Switch(props: SwitchProps) {
  const children:any = resolve(() => props.children)

  const fallback = isNullUndefined(props.fallback)
    ? null
    : memo(() => resolve(props.fallback))

  const match = memo(() =>
    children().find(match => !!getValue(match.when)),
  )
  const value = memo(() => match() && getValue(match().when))
  const callback = memo(
    () => match() && makeCallback(match().children),
  )
  return memo(() => (match() ? callback()(value) : fallback))
}

/**
 * Renders the content if the `when` condition is true
 *
 * @param {MatchProps} props
 * @returns {any}
 */
export const Match = (props: MatchProps) => props
