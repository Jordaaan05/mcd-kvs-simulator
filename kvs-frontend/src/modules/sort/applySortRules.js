/*
    Applies filtering / sorting rules stored in JSON to an array of items.
*/

function getNestedValue(obj, path) {
    if (!path) return undefined;
    if (path.startsWith('categoryIndex:')) {
        const [, rest] = path.split(":");
        const [idxStr, ...propParts] = rest.split(".");
        const idx = parseInt(idxStr, 10);
        if (!Array.isArray(obj.Categories) || obj.Categories.length <= idx) return undefined;
        const cat = obj.Categories[idx];
        return propParts.reduce((acc, p) => (acc && acc[p] !== undefined ? acc[p] : undefined), cat);
    }
    if (path.startsWith('category.')) {
        const prop = path.slice('category.'.length);
        const cat = Array.isArray(obj.Categories) ? obj.Categories[0] : undefined;
        return cat ? cat[prop] : undefined;
    }

    return obj[path];
}

function toLowerSafe(s) {
    return s && typeof s === 'string' ? s.toLowerCase(): ''
}

function itemHasCategory(item, categoryNames = []) {
    if (!Array.isArray(item.Categories)) return false;
    const categoryLower = item.Categories.map(c => toLowerSafe(c.name));
    return categoryNames.some(name => categoryLower.includes(toLowerSafe(name)));
}

function applyFilter(itemsSlice = [], filter = null) {
    if (!filter) return itemsSlice.slice();
    const {
        includeCategories,
        excludeCategories,
        includeIfAnyCategoryMatches = true,
        includePredicate,
    } = filter;

    if (!includeCategories && !excludeCategories) {
        return itemsSlice.slice();
    }

    return itemsSlice.filter(item => {
        if (excludeCategories && itemHasCategory(item, excludeCategories)) return false;

        if (includeCategories) {
            const match = itemHasCategory(item, includeCategories);
            return includeIfAnyCategoryMatches ? match : !match;
        }
        // default behaviour
        return true
    })
}

function buildComparator(rule) {
    // rule: { by: "category.sortID" | "categoryIndex:0.sortID" | "ID" | "custom", dir: "asc"|"desc"}
    const dir = rule.dir === 'desc' ? -1 : 1;
    const by = rule.by;

    return (a, b) => {
        // special handling for category lookup: prefer first matching category listed in 'categoryMatch'
        if (by === 'category.sortID' || by.startsWith('categoryIndex:') || by.startsWith('category.')) {
            const valA = getNestedValue(a, by);
            const valB = getNestedValue(b, by);
            if (valA === undefined && valB === undefined) return 0;
            if (valA === undefined) return -1 * dir;
            if (valB === undefined) return 1 * dir;
            if (valA < valB) return -1 * dir;
            if (valA > valB) return 1 * dir;
            return 0;
        }

        // compare values if both numbers
        const aVal = a[by];
        const bVal = b[by];

        if (aVal === undefined && bVal === undefined) return 0;
        if (aVal === undefined) return 1 * dir;
        if (bVal === undefined) return -1 * dir;

        if (typeof(aVal) === 'number' && typeof(bVal) === 'number') {
            return (aVal - bVal) * dir;
        }

        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        if (aStr < bStr) return -1 * dir;
        if (aStr > bStr) return 1 * dir;
        return 0;
    };
}

export default function applySortRules(itemsSlice = [], sortConfig = null, context = {}) {
    // defensive: ensure array copy to avoid mutation of original order
    let items = Array.isArray(itemsSlice) ? itemsSlice.slice() : [];

    if (!sortConfig) return items;

    // 1. filtering
    const filtered = applyFilter(items, sortConfig.filter);

    // 2. sorting
    const sortRules = Array.isArray(sortConfig.sort) ? sortConfig.sort : null;
    if (!sortRules || sortRules.length === 0) {
        return filtered;
    }

    const comparators = sortRules.map(buildComparator);
    
    const compositeComparator = (a, b) => {
        for (let cmp of comparators) {
            const r = cmp(a, b);
            if (r !== 0) return r;
        }
        return 0;
    };

    const sorted = filtered.slice().sort(compositeComparator)
    return sorted;
}