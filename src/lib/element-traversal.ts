/**
 * Traverses up the DOM tree from a starting element, applying a callback function
 * to each parent element that matches the criteria until reaching the document body
 * @param element The starting DOM element
 * @param callback Function to apply to each matching parent element
 * @param isSquare Function to determine if an element is considered a 'square'
 */
export function traverseParents(
  element: HTMLElement | null,
  callback: (element: HTMLElement, index: number) => void,
  isSquare: (element: HTMLElement) => boolean = () => true,
) {
  if (!element) return;

  let currentElement: HTMLElement | null = element;
  let index = 0;

  // Skip the starting element itself and begin with its parent
  currentElement = currentElement.parentElement;

  while (currentElement && currentElement !== document.body) {
    if (isSquare(currentElement)) {
      callback(currentElement, index);
      index++;
    }
    currentElement = currentElement.parentElement;
  }

  // Finally, handle the body element if needed
  if (currentElement === document.body) {
    callback(currentElement, index);
  }
}

/**
 * Default function to determine if an element is a 'square'
 * This can be customized based on your specific criteria
 */
export function isSquareElement(element: HTMLElement): boolean {
  // Default implementation considers elements with width/height ratio between 0.8 and 1.2 as squares
  // or elements with specific classes/attributes
  const rect = element.getBoundingClientRect();
  const ratio = rect.width / rect.height;

  // Check if element has square-like dimensions
  const isSquareDimensions = ratio >= 0.8 && ratio <= 1.2;

  // Check if element has specific classes that might indicate it's a square container
  const hasSquareClass =
    element.classList.contains("square") ||
    element.classList.contains("box") ||
    element.classList.contains("container");

  // Check if element has specific data attributes
  const hasSquareAttribute =
    element.hasAttribute("data-square") ||
    element.hasAttribute("data-container");

  return isSquareDimensions || hasSquareClass || hasSquareAttribute;
}
