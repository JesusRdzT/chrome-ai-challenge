import { SpeechSynthesis } from "./speech-synthesis.js";


/**
 * @typedef {Object} CallbackProps
 * @property {Function} onclick
 * @property {Function} onchange
 * @property {Function} oninput
 * @property {Function} onsubmit
 * @property {Function} onfocus
 * @property {Function} onblur
 */


/**
 * @typedef {Object} BaseProps
 * @property {CSSStyleDeclaration} style
 * @property {string[]|string} classList
 * @property {string} id
 * @property {string} name
 * @property {string} text
 * @property {HTMLElement[]} children
 * @property {HTMLElement|undefined} parent
 */

/**
 * @typedef {Object} TextProps
 * @property {'p'|'h1'|'h2'|'h3'|'h4'|'h5'|'h6'|'span'} level - The level of the text in the dom hierarchy
 */


/**
 * @typedef {BaseProps & CallbackProps & Record<string, any>} ElementProps
 */

/**
 * @typedef {ElementProps & TextProps} TextElementProps
 */


export class NodeBuilder {
	/**
	 * Creates a new NodeBuilder instance
	 * @param {keyof HTMLElementTagNameMap | HTMLElement} element - The element to create
	 */
	constructor(element) {
		if (element instanceof HTMLElement) {
			this.node = element;
		} else {
			this.node = document.createElement(element);
		}
	}

	/**
	 * Configures the node with the given node properties
	 * @param {ElementProps} props - The properties of the element
	 */
	setProps({ id, name, classList, style, text, children, parent, ...attributes } = {}) {
		if (!!id) this.node.id = id;
		if (!!name) this.node.name = name;

		if (classList instanceof Array) {
			this.setClassList(...classList);
		} else if (typeof classList === "string") {
			this.setClass(classList);
		}

		if (!!style) this.setStyle(style);

		if (!!text) {
			this.setText(text);
		}

		if (!!attributes) this.setAttributes(attributes);

		if (children instanceof Array) {
			this.setChildren(...children);
		}

		if (!!parent) this.appendTo(parent);

		return this;
	}

	/**
	 * Adds classes to the node
	 * @param {string[]} classList - The classes to add to the node
	 * @returns {NodeBuilder} - The NodeBuilder instance
	 */
	setClassList(...classList) {
		this.node.classList.add(...classList);
		return this;
	}

	/**
	 * Adds a class string to the node
	 * @param {string} className - The class string to add to the node
	 * @returns {NodeBuilder} - The NodeBuilder instance
	 */
	setClass(className) {
		this.node.classList.add(...className.split(" "));
		return this;
	}

	/**
	 * Adds a class string to the node
	 * @param {string} className - The class string to add to the node
	 * @returns {NodeBuilder} - The NodeBuilder instance
	 */
	removeFromClassList(...classList) {
		this.node.classList.remove(...classList);
		return this;
	}

	/**
	 * Adds styles to the node
	 * @param {CSSStyleDeclaration} styles - The styles to add to the node
	 * @returns {NodeBuilder} - The NodeBuilder instance
	 */
	setStyle(styles = {}) {
		for (const key in styles) {
			this.node.style[key] = styles[key];
		}
		return this;
	}

	/**
	 * Adds attributes to the node
	 * @param {Record<string, any>} attributes - The attributes to add to the node
	 * @returns {NodeBuilder} - The NodeBuilder instance
	 */
	setAttributes(attributes = {}) {
		for (const [key, value] of Object.entries(attributes)) {
			this.node[key] = value;
		}
		return this;
	}

	/**
	 * Appends the node to a parent node
	 * @param {HTMLElement | NodeBuilder} parent - The parent node to append the node to
	 * @returns {NodeBuilder} - The NodeBuilder instance
	 * @throws {Error} - If the parent is not a valid DOM element
	 */
	appendTo(parent) {
		console.log(parent);
		if (parent instanceof HTMLElement) {
			parent.appendChild(this.node);
		} else if (parent instanceof NodeBuilder) {
			parent.node.appendChild(this.node);
		} else {
			throw new Error("Parent must be a valid DOM element.");
		}
		return this;
	}

	/**
	 * Adds children to the node
	 * @param {HTMLElement[]} children - The children to add to the node
	 * @returns {NodeBuilder} - The NodeBuilder nstance
	 */
	setChildren(...children) {
		for (const child of children) {
			if (child instanceof HTMLElement) {
				this.node.appendChild(child);
			} else if (child instanceof NodeBuilder) {
				this.node.appendChild(child.node);
			}
		}
		return this;
	}

	/**
	 * Adds text content to the node
	 * @param {string} text - The text content to add to the node
	 * @returns {NodeBuilder} - The NodeBuilder instance
	 */
	setText(text) {
		this.node.textContent = text;
		return this;
	}

	setInnerHTML(html) {
		this.node.innerHTML = html;
		return this;
	}

	setMarkdown(str) {
		this.node.innerHTML = marked(str);
		return this;
	}

	querySelector(selector) {
		return this.node.querySelector(selector);
	}
}



export class BaseComponents {
	/**
	 * Flex box element with row direction
	 * @param {ElementProps} props - The properties of the element
	 */
	static Row(props) {
		return new NodeBuilder("div")
			.setProps(props)
			.setClassList("ext-row");
	}

	/**
	 * Flex box element with column direction
	 * @param {ElementProps} props - The properties of the element
	 */
	static Col(props) {
		return new NodeBuilder("div")
			.setProps(props)
			.setClassList("ext-col");
	}

	/**
	 * Button element
	 * @param {ElementProps} props - The properties of the element
	 */
	static Button(props) {
		return new NodeBuilder("button")
			.setProps(props)
	}

	/**
	 * Input element
	 * @param {ElementProps} props - The properties of the element
	 */
	static Input(props) {
		return new NodeBuilder("input")
			.setProps(props)
			.setClassList("ext-primary-input");
	}

	/**
	 * Text element
	 * @param {TextElementProps} props - The properties of the element
	 */
	static Text({ level = "p", ...props }) {
		return new NodeBuilder(level)
			.setProps(props);
	}

	static Loader() {
		return new NodeBuilder("div").setClassList("ext-spinner")
	}

	/**
	 * Dialog element
	 * @param {ElementProps} props - The properties of the element
	 * @returns {NodeBuilder} - The NodeBuilder
	 */
	static Dialog(props) {
		return BaseComponents.Col({
			...props,
			children: [
				BaseComponents.Button({
					text: '❌',
					classList: 'close-btn',
					onclick: e => e.target.parentNode.remove()
				}),
				BaseComponents.Row({ id: "ext-dialog-header" }),
				BaseComponents.Col({ id: "ext-dialog-content" }),
				BaseComponents.Row({
					id: "ext-dialog-footer",
					style: {
						gap: '0.5rem'
					}
				})
			]
		}).setClassList('ext-dialog-box');;
	}
}



/**
 * Gets the bounding rectangle of the current selection
 */
export function getSelectionBoundingRect() {
	const selection = window.getSelection();
	if (!selection?.rangeCount) return null;

	const range = selection.getRangeAt(0);

	return range.getBoundingClientRect();
}

