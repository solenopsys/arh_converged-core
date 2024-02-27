
import { memo } from '../solid'
import { map } from '../uitls/map'
import { makeCallback } from '../uitls/utils'


/**
 * Renders reactive values from an signal that returns an Iterable
 * object
 *
 * @param {object} props
 * @param {Each} props.each
 * @param {Children} [props.children]
 * @returns {Children}
 * @url https://pota.quack.uy/Components/For
 */
export function For(props) {
    const callback = makeCallback(props.children)
    return memo(() => map(props.each, callback, true))
}