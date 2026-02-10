import { useContext } from 'react'
import { AppContext } from './AppContext.js'
import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router-dom'
import { buildCatalogSearchString } from '../utils/catalogQuery.js'

const BrandBar = observer(() => {
    const { catalog } = useContext(AppContext)
    const navigate = useNavigate()

    const handleClick = (id) => {
        const brand = id === catalog.brand || id === null ? null : id
        const query = buildCatalogSearchString({
            category: catalog.category,
            brand,
            page: 1,
            q: catalog.q,
            sort: catalog.sort,
        })
        navigate({
            pathname: '/',
            search: query ? '?' + query : '',
        })
    }

    return (
        <div className="brand-chips">
            <button
                type="button"
                className={`brand-chip${!catalog.brand ? ' is-active' : ''}`}
                onClick={() => handleClick(null)}
            >
                Все бренды
            </button>
            {catalog.brands.map(item =>
                <button
                    key={item.id}
                    type="button"
                    className={`brand-chip${item.id === catalog.brand ? ' is-active' : ''}`}
                    onClick={() => handleClick(item.id)}
                >
                    {item.name}
                </button>
            )}
        </div>
    )
})

export default BrandBar
