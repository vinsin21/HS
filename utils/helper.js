const mongooseAggregatePaginationOptions = ({ page = 1, limit = 10, customLabels }) => {
    return {
        page: Math.max(page, 1),
        limit: Math.max(limit, 10),
        pagination: true,
        customLabels: {
            pagingCounter: "pageCounter",
            ...customLabels
        }
    }

}

module.exports = {
    mongooseAggregatePaginationOptions
}
