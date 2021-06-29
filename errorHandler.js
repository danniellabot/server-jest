export const errorHandler = async (res) => {
    res.status(500).json({
        "message": 'Something went wrong. Please try again or contact support.',
    })
}