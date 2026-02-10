import { Button } from 'react-bootstrap'
import { useContext } from 'react'
import { AppContext } from './AppContext.js'
import formatPrice from '../utils/formatPrice.js'

const BasketItem = (props) => {
    const { currency } = useContext(AppContext)

    return (
        <tr>
            <td>{props.name}</td>
            <td>
                <Button variant="outline-dark" size="sm" onClick={() => props.decrement(props.id)}>-</Button>
                {' '}<strong>{props.quantity}</strong>{' '}
                <Button variant="outline-dark" size="sm" onClick={() => props.increment(props.id)}>+</Button>
            </td>
            <td>{formatPrice(props.price, currency.code, currency.rubToKztRate)}</td>
            <td>{formatPrice(props.price * props.quantity, currency.code, currency.rubToKztRate)}</td>
            <td>
                <Button variant="link" onClick={() => props.remove(props.id)}>
                    Удалить
                </Button>
            </td>
        </tr>
    );
}

export default BasketItem
