import { useContext } from 'react'
import { AppContext } from './AppContext.js'
import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router-dom'
import { buildCatalogSearchString } from '../utils/catalogQuery.js'

const CategoryBar = observer(() => {
    const { catalog } = useContext(AppContext)
    const navigate = useNavigate()

    const handleClick = (id) => {
        const category = id === catalog.category || id === null ? null : id
        const query = buildCatalogSearchString({
            category,
            brand: catalog.brand,
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
        <div className="category-list">
            <button
                type="button"
                className={`category-list__item${!catalog.category ? ' is-active' : ''}`}
                onClick={() => handleClick(null)}
            >
                Все категории
            </button>
            {catalog.categories.map(item =>
                <button
                    key={item.id}
                    type="button"
                    className={`category-list__item${item.id === catalog.category ? ' is-active' : ''}`}
                    onClick={() => handleClick(item.id)}
                >
                    {item.name}
                </button>
            )}
        </div>
    )
})

export default CategoryBar
