export default class Resp {
	#message = "";
	#status = 200;
	constructor(status?: number, message?: string) {
		if (status) this.#status = status;
		if (message) this.#message = message;
	}

	setStatus(status: number) {
		this.#status = status;
		return this;
	}

	setMessage(message: string) {
		this.#message = message;
		return this;
	}

	build() {
		return Response.json(
			{ message: this.#message },
			{ status: this.#status }
		)
	}
}
