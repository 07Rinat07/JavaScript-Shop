import { Spinner } from 'react-bootstrap'

const Loader = ({fullscreen = true}) => {
    const style = {
        width: '100%',
        height: fullscreen ? '100vh' : '38vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }
    return (
        <div style={style}>
            <Spinner animation="grow" variant="primary" />
        </div>
    )
}

export default Loader
