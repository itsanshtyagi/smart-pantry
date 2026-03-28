export function sortByExpiry(a, b) {
    return new Date(a.expiry_date) - new Date(b.expiry_date);
}

export function sortByName(a, b) {
    return a.item_name.localeCompare(b.item_name);
}

export function sortByCategory(a, b) {
    return a.category.localeCompare(b.category);
}

export function sortByDateAdded(a, b) {
    return new Date(b.created_at) - new Date(a.created_at);
}

export function getSortFunction(sortBy) {
    switch (sortBy) {
        case 'name': return sortByName;
        case 'category': return sortByCategory;
        case 'date_added': return sortByDateAdded;
        case 'expiry':
        default: return sortByExpiry;
    }
}
