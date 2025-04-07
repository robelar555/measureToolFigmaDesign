"use client";

import { useEffect, useRef, useState } from "react";
import { traverseParents, isSquareElement } from "@/lib/element-traversal";

interface ElementTraversalProps {
  targetSelector?: string;
  children: React.ReactNode;
  onTraverse?: (elements: HTMLElement[], event?: MouseEvent) => void;
  highlightColor?: string;
  autoHighlight?: boolean;
}

/**
 * Component that provides functionality to traverse parent elements
 * and apply effects to all containing 'squares' in the correct order
 */
export default function ElementTraversal({
  targetSelector = "*",
  children,
  onTraverse,
  highlightColor = "rgba(0, 255, 0, 0.2)",
  autoHighlight = false,
}: ElementTraversalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [highlightedElements, setHighlightedElements] = useState<HTMLElement[]>(
    [],
  );

  // Clear any existing highlights
  const clearHighlights = () => {
    highlightedElements.forEach((el) => {
      el.style.removeProperty("outline");
      el.style.removeProperty("background-color");
      el.style.removeProperty("transition");
    });
    setHighlightedElements([]);
  };

  // Apply highlight effect to elements
  const highlightElements = (elements: HTMLElement[]) => {
    clearHighlights();

    elements.forEach((el, index) => {
      const delay = index * 100; // Staggered effect
      el.style.outline = `2px solid ${highlightColor}`;
      el.style.backgroundColor = highlightColor;
      el.style.transition = "outline 0.3s ease, background-color 0.3s ease";

      // Store highlighted elements for later cleanup
      setHighlightedElements((prev) => [...prev, el]);
    });
  };

  // Handle click events on target elements
  const handleElementClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;

    // Check if the clicked element matches the selector
    if (target.matches(targetSelector) || targetSelector === "*") {
      event.stopPropagation();

      const matchingElements: HTMLElement[] = [];

      // Traverse up the DOM tree and collect matching elements
      traverseParents(
        target,
        (element, index) => {
          matchingElements.push(element);
        },
        isSquareElement,
      );

      // Apply highlight if auto-highlight is enabled
      if (autoHighlight) {
        highlightElements(matchingElements);
      }

      // Call the onTraverse callback if provided
      if (onTraverse) {
        onTraverse(matchingElements, event);
      }
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Add click event listener
    container.addEventListener("click", handleElementClick as EventListener);

    return () => {
      // Clean up event listener and highlights
      container.removeEventListener(
        "click",
        handleElementClick as EventListener,
      );
      clearHighlights();
    };
  }, [targetSelector, onTraverse, autoHighlight]);

  return (
    <div ref={containerRef} className="element-traversal-container">
      {children}
    </div>
  );
}
