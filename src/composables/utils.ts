export const rawDatatoObject: <T>(data: any) => T = (data: any) => {
	if (typeof data !== "string") return JSON.parse(JSON.stringify(data))
	else return JSON.parse(data)
}
