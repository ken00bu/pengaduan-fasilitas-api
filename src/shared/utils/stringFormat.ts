function formatTicketId(id: number, createdAt: Date): string {
    const date = new Date(createdAt)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const ticketId = String(id).padStart(5, "0")

    return `FIX-${year}-${month}${day}${ticketId}`
}

export { formatTicketId }
