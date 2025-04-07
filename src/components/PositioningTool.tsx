"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Measurement {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

interface BoxData {
  id: number;
  measurements: Measurement;
  color: string;
}

export default function PositioningTool() {
  const [newBoxMeasurements, setNewBoxMeasurements] = useState<Measurement>({
    top: "",
    right: "",
    bottom: "",
    left: "",
  });

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const [boxes, setBoxes] = useState<BoxData[]>([]);
  const [nextBoxId, setNextBoxId] = useState(1);

  // Handle input changes for box measurements
  const handleBoxMeasurementChange = (
    key: keyof Measurement,
    value: string,
  ) => {
    setNewBoxMeasurements((prev) => ({ ...prev, [key]: value }));
  };

  // Generate code snippets based on boxes
  const generateCodeSnippets = () => {
    if (boxes.length === 0) {
      return [
        "<div>No boxes added yet</div>",
        "<div>No boxes added yet</div>",
        "<div>No boxes added yet</div>",
        "<div>No boxes added yet</div>",
      ];
    }

    // Use the innermost box (first added) for measurements
    const innerBox = boxes[0];
    const element = {
      top: innerBox.measurements.top || "0",
      right: innerBox.measurements.right || "0",
      bottom: innerBox.measurements.bottom || "0",
      left: innerBox.measurements.left || "0",
    };

    // Use the outermost box (last added) for container if available
    const outerBox = boxes.length > 1 ? boxes[boxes.length - 1] : null;
    const container = outerBox
      ? {
          top: outerBox.measurements.top || "0",
          right: outerBox.measurements.right || "0",
          bottom: outerBox.measurements.bottom || "0",
          left: outerBox.measurements.left || "0",
        }
      : {
          top: "0",
          right: "0",
          bottom: "0",
          left: "0",
        };

    // Calculate dimensions and positions
    const width = `calc(${container.right} - ${container.left} - ${element.right} - ${element.left})`;
    const height = `calc(${container.bottom} - ${container.top} - ${element.bottom} - ${element.top})`;

    // Generate different positioning code snippets
    return [
      // Absolute positioning
      `<div style="
  position: absolute;
  top: ${element.top};
  right: ${element.right};
  bottom: ${element.bottom};
  left: ${element.left};
"></div>`,

      // Flexbox
      `<div style="
  display: flex;
  padding: ${element.top} ${element.right} ${element.bottom} ${element.left};
  width: ${width};
  height: ${height};
"></div>`,

      // Grid
      `<div style="
  display: grid;
  grid-template-columns: ${element.left} 1fr ${element.right};
  grid-template-rows: ${element.top} 1fr ${element.bottom};
  width: ${width};
  height: ${height};
"></div>`,

      // Margin-based
      `<div style="
  margin: ${element.top} ${element.right} ${element.bottom} ${element.left};
  width: calc(100% - ${element.left} - ${element.right});
  height: calc(100% - ${element.top} - ${element.bottom});
"></div>`,
    ];
  };

  // Copy code to clipboard
  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Box calculation state
  const [selectedBoxId, setSelectedBoxId] = useState<number | null>(null);

  // Calculate padding based on parent box
  const calculatePadding = (childBox: Measurement, parentBox: Measurement) => {
    return {
      top:
        childBox.top && parentBox.top
          ? `${parseInt(childBox.top) - parseInt(parentBox.top)}px`
          : undefined,
      right:
        childBox.right && parentBox.right
          ? `${parseInt(parentBox.right) - parseInt(childBox.right)}px`
          : undefined,
      bottom:
        childBox.bottom && parentBox.bottom
          ? `${parseInt(parentBox.bottom) - parseInt(childBox.bottom)}px`
          : undefined,
      left:
        childBox.left && parentBox.left
          ? `${parseInt(childBox.left) - parseInt(parentBox.left)}px`
          : undefined,
    };
  };

  // Add a new box with current measurements
  const addBox = () => {
    const colors = [
      "border-green-600 bg-white/40",
      "border-green-500 bg-white/60",
      "border-green-400 bg-white/80",
      "border-green-300 bg-white",
    ];

    const newBox: BoxData = {
      id: nextBoxId,
      measurements: { ...newBoxMeasurements },
      color: colors[Math.min(boxes.length, colors.length - 1)],
    };

    const newBoxes = [...boxes, newBox];
    setBoxes(newBoxes);
    setNextBoxId(nextBoxId + 1);
    setSelectedBoxId(nextBoxId); // Select the newly added box

    // Reset measurements for next box
    setNewBoxMeasurements({
      top: "",
      right: "",
      bottom: "",
      left: "",
    });
  };

  // Remove a box by id
  const removeBox = (id: number) => {
    setBoxes(boxes.filter((box) => box.id !== id));
  };

  // Reset all boxes
  const resetBoxes = () => {
    setBoxes([]);
    setNextBoxId(1);
    setSelectedBoxId(null);
    setNewBoxMeasurements({
      top: "",
      right: "",
      bottom: "",
      left: "",
    });
  };

  const codeSnippets = generateCodeSnippets();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-6">
      <Card className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-100 to-teal-100 rounded-t-lg">
          <CardTitle className="text-2xl text-green-800">
            Figma Ruler Measurements to HTML Converter
          </CardTitle>
          <CardDescription className="text-green-700">
            Input measurements from Figma rulers and generate HTML/CSS code for
            positioning elements.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          {/* Box Builder */}
          <div className="mb-8 p-4 border border-green-200 rounded-md bg-green-50">
            <h3 className="text-lg font-medium text-green-700 mb-2">
              Box Builder
            </h3>
            <p className="text-green-600 mb-4">
              Add boxes one at a time, starting with the innermost element
            </p>

            {/* Box Measurements */}
            <div className="space-y-4 mb-4">
              <h4 className="text-md font-medium text-green-700">
                New Box Measurements
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="box-top" className="text-green-600">
                    Top
                  </Label>
                  <Input
                    id="box-top"
                    placeholder="e.g., 10px"
                    value={newBoxMeasurements.top}
                    onChange={(e) =>
                      handleBoxMeasurementChange("top", e.target.value)
                    }
                    className="border-green-200 focus:border-green-500"
                  />
                </div>
                <div>
                  <Label htmlFor="box-right" className="text-green-600">
                    Right
                  </Label>
                  <Input
                    id="box-right"
                    placeholder="e.g., 20px"
                    value={newBoxMeasurements.right}
                    onChange={(e) =>
                      handleBoxMeasurementChange("right", e.target.value)
                    }
                    className="border-green-200 focus:border-green-500"
                  />
                </div>
                <div>
                  <Label htmlFor="box-bottom" className="text-green-600">
                    Bottom
                  </Label>
                  <Input
                    id="box-bottom"
                    placeholder="e.g., 15px"
                    value={newBoxMeasurements.bottom}
                    onChange={(e) =>
                      handleBoxMeasurementChange("bottom", e.target.value)
                    }
                    className="border-green-200 focus:border-green-500"
                  />
                </div>
                <div>
                  <Label htmlFor="box-left" className="text-green-600">
                    Left
                  </Label>
                  <Input
                    id="box-left"
                    placeholder="e.g., 25px"
                    value={newBoxMeasurements.left}
                    onChange={(e) =>
                      handleBoxMeasurementChange("left", e.target.value)
                    }
                    className="border-green-200 focus:border-green-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <Button
                onClick={addBox}
                className="bg-green-600 hover:bg-green-700"
                disabled={
                  !newBoxMeasurements.top &&
                  !newBoxMeasurements.right &&
                  !newBoxMeasurements.bottom &&
                  !newBoxMeasurements.left
                }
              >
                Add Box
              </Button>
              <Button
                onClick={resetBoxes}
                variant="outline"
                className="border-green-600 text-green-700 hover:bg-green-50"
              >
                Reset All Boxes
              </Button>
            </div>

            {/* Box Preview */}
            <div className="relative border-2 border-dashed border-green-300 p-12 min-h-[400px] bg-white/90">
              {boxes.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-green-600 opacity-70">
                  Add boxes to visualize placement
                </div>
              ) : (
                <div className="relative">
                  {/* Render boxes in reverse order (outermost first) */}
                  {[...boxes]
                    .reverse()
                    .reduce((children, box, reversedIndex) => {
                      const index = boxes.length - 1 - reversedIndex;

                      // Calculate positioning based on measurements
                      const style: React.CSSProperties = {
                        position: "relative",
                        top: box.measurements.top ? undefined : undefined,
                        right: box.measurements.right ? undefined : undefined,
                        bottom: box.measurements.bottom ? undefined : undefined,
                        left: box.measurements.left ? undefined : undefined,
                        padding: "1rem",
                        border: "2px solid",
                        borderRadius: "0.25rem",
                        margin: "0 auto",
                        width: "fit-content",
                        minWidth: "180px",
                        minHeight: "100px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                      };

                      // If this is not the outermost box, calculate padding from measurements
                      if (index < boxes.length - 1) {
                        const parentBox = boxes[index + 1];
                        if (
                          parentBox &&
                          box.measurements.top &&
                          parentBox.measurements.top
                        ) {
                          const topDiff =
                            parseInt(box.measurements.top) -
                            parseInt(parentBox.measurements.top);
                          style.marginTop = `${topDiff}px`;
                        }
                        if (
                          parentBox &&
                          box.measurements.left &&
                          parentBox.measurements.left
                        ) {
                          const leftDiff =
                            parseInt(box.measurements.left) -
                            parseInt(parentBox.measurements.left);
                          style.marginLeft = `${leftDiff}px`;
                        }
                        if (
                          parentBox &&
                          box.measurements.right &&
                          parentBox.measurements.right
                        ) {
                          const rightDiff =
                            parseInt(parentBox.measurements.right) -
                            parseInt(box.measurements.right);
                          style.marginRight = `${rightDiff}px`;
                        }
                        if (
                          parentBox &&
                          box.measurements.bottom &&
                          parentBox.measurements.bottom
                        ) {
                          const bottomDiff =
                            parseInt(parentBox.measurements.bottom) -
                            parseInt(box.measurements.bottom);
                          style.marginBottom = `${bottomDiff}px`;
                        }
                      }

                      // Calculate dimensions for display
                      const boxWidth = style.width || "auto";
                      const boxHeight = style.height || "auto";
                      const marginTop = style.marginTop || "0px";
                      const marginRight = style.marginRight || "0px";
                      const marginBottom = style.marginBottom || "0px";
                      const marginLeft = style.marginLeft || "0px";

                      return (
                        <div
                          key={box.id}
                          className={`${box.color} ${selectedBoxId === box.id ? "ring-2 ring-blue-500" : ""} relative`}
                          style={style}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBoxId(box.id);
                          }}
                        >
                          {/* Box label */}
                          {index === 0 ? (
                            <div className="text-center font-medium">
                              Innermost Box
                            </div>
                          ) : (
                            <div className="text-center font-medium">
                              Box {index + 1}
                            </div>
                          )}

                          {/* Dimensions display */}
                          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs bg-white/90 px-1 rounded border border-green-200 whitespace-nowrap">
                            {typeof style.minWidth === "string"
                              ? style.minWidth
                              : "auto"}{" "}
                            ×{" "}
                            {typeof style.minHeight === "string"
                              ? style.minHeight
                              : "auto"}
                          </div>

                          {/* Margin indicators - only show if there's a margin */}
                          {marginTop !== "0px" && (
                            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs bg-white/90 px-1 rounded border border-amber-200 whitespace-nowrap">
                              ↕ {marginTop}
                            </div>
                          )}
                          {marginLeft !== "0px" && (
                            <div className="absolute top-1/2 -left-12 transform -translate-y-1/2 text-xs bg-white/90 px-1 rounded border border-amber-200 whitespace-nowrap">
                              ← {marginLeft}
                            </div>
                          )}
                          {marginRight !== "0px" && (
                            <div className="absolute top-1/2 -right-12 transform -translate-y-1/2 text-xs bg-white/90 px-1 rounded border border-amber-200 whitespace-nowrap">
                              {marginRight} →
                            </div>
                          )}
                          {marginBottom !== "0px" && (
                            <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs bg-white/90 px-1 rounded border border-amber-200 whitespace-nowrap">
                              ↕ {marginBottom}
                            </div>
                          )}

                          {/* Padding indicator - only show for the innermost box */}
                          {index === 0 && (
                            <div className="absolute top-0 right-0 text-xs bg-white/90 px-1 rounded-bl border border-green-200 whitespace-nowrap">
                              Padding: {style.padding}
                            </div>
                          )}

                          {children}
                        </div>
                      );
                    }, null)}
                </div>
              )}
            </div>

            {/* Box Measurements List */}
            {boxes.length > 0 && (
              <div className="mt-4">
                <h4 className="text-md font-medium text-green-700 mb-2">
                  Added Boxes ({boxes.length})
                </h4>
                <div className="space-y-2">
                  {boxes.map((box, index) => (
                    <div
                      key={box.id}
                      className={`flex items-center justify-between p-2 rounded border ${selectedBoxId === box.id ? "bg-green-100 border-green-400" : "bg-white/80 border-green-200"} cursor-pointer`}
                      onClick={() => setSelectedBoxId(box.id)}
                    >
                      <span className="font-medium text-green-800">
                        {index === 0 ? "Innermost Box" : `Box ${index + 1}`}
                      </span>
                      <div className="text-xs text-green-600">
                        {box.measurements.top && (
                          <span className="mr-2">
                            T: {box.measurements.top}
                          </span>
                        )}
                        {box.measurements.right && (
                          <span className="mr-2">
                            R: {box.measurements.right}
                          </span>
                        )}
                        {box.measurements.bottom && (
                          <span className="mr-2">
                            B: {box.measurements.bottom}
                          </span>
                        )}
                        {box.measurements.left && (
                          <span className="mr-2">
                            L: {box.measurements.left}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBox(box.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Code Output and HTML Representation */}
          <div className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Code Output */}
              <div>
                <h3 className="text-lg font-medium text-green-700 mb-4">
                  Generated Code
                </h3>
                <Tabs defaultValue="absolute" className="w-full">
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger
                      value="absolute"
                      className="data-[state=active]:bg-green-100"
                    >
                      Absolute
                    </TabsTrigger>
                    <TabsTrigger
                      value="flexbox"
                      className="data-[state=active]:bg-green-100"
                    >
                      Flexbox
                    </TabsTrigger>
                    <TabsTrigger
                      value="grid"
                      className="data-[state=active]:bg-green-100"
                    >
                      Grid
                    </TabsTrigger>
                    <TabsTrigger
                      value="margin"
                      className="data-[state=active]:bg-green-100"
                    >
                      Margin
                    </TabsTrigger>
                  </TabsList>

                  {codeSnippets.map((snippet, index) => (
                    <TabsContent
                      key={index}
                      value={["absolute", "flexbox", "grid", "margin"][index]}
                      className="relative"
                    >
                      <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-sm">
                        {snippet}
                      </pre>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2 bg-green-50 hover:bg-green-100 text-green-700"
                        onClick={() => copyToClipboard(snippet, index)}
                      >
                        {copiedIndex === index ? "Copied!" : "Copy"}
                      </Button>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>

              {/* Box Calculations */}
              <div>
                <h3 className="text-lg font-medium text-green-700 mb-4">
                  Box Calculations
                </h3>
                <div className="border-2 border-green-200 rounded-md p-4 bg-white min-h-[300px] overflow-auto">
                  {boxes.length === 0 ? (
                    <div className="text-green-600 opacity-70 text-center">
                      Add boxes to see calculations
                    </div>
                  ) : selectedBoxId ? (
                    <div className="space-y-4">
                      {boxes.map((box, index) => {
                        if (box.id === selectedBoxId) {
                          // Find parent box if exists
                          const parentIndex = index + 1;
                          const parentBox =
                            parentIndex < boxes.length
                              ? boxes[parentIndex]
                              : null;

                          // Calculate differences if parent exists
                          const calculations = parentBox
                            ? {
                                top:
                                  parentBox.measurements.top &&
                                  box.measurements.top
                                    ? `${parseInt(box.measurements.top) - parseInt(parentBox.measurements.top)}px`
                                    : "N/A",
                                right:
                                  parentBox.measurements.right &&
                                  box.measurements.right
                                    ? `${parseInt(parentBox.measurements.right) - parseInt(box.measurements.right)}px`
                                    : "N/A",
                                bottom:
                                  parentBox.measurements.bottom &&
                                  box.measurements.bottom
                                    ? `${parseInt(parentBox.measurements.bottom) - parseInt(box.measurements.bottom)}px`
                                    : "N/A",
                                left:
                                  parentBox.measurements.left &&
                                  box.measurements.left
                                    ? `${parseInt(box.measurements.left) - parseInt(parentBox.measurements.left)}px`
                                    : "N/A",
                              }
                            : null;

                          return (
                            <div
                              key={box.id}
                              className="bg-green-50 p-4 rounded-md"
                            >
                              <h4 className="font-medium text-green-800 mb-2">
                                {index === 0
                                  ? "Innermost Box"
                                  : `Box ${index + 1}`}{" "}
                                Calculations
                              </h4>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h5 className="text-sm font-medium text-green-700 mb-1">
                                    Box Measurements
                                  </h5>
                                  <ul className="text-sm space-y-1">
                                    <li>
                                      Top: {box.measurements.top || "Not set"}
                                    </li>
                                    <li>
                                      Right:{" "}
                                      {box.measurements.right || "Not set"}
                                    </li>
                                    <li>
                                      Bottom:{" "}
                                      {box.measurements.bottom || "Not set"}
                                    </li>
                                    <li>
                                      Left: {box.measurements.left || "Not set"}
                                    </li>
                                  </ul>
                                </div>

                                {parentBox && (
                                  <div>
                                    <h5 className="text-sm font-medium text-green-700 mb-1">
                                      Parent Box Measurements
                                    </h5>
                                    <ul className="text-sm space-y-1">
                                      <li>
                                        Top:{" "}
                                        {parentBox.measurements.top ||
                                          "Not set"}
                                      </li>
                                      <li>
                                        Right:{" "}
                                        {parentBox.measurements.right ||
                                          "Not set"}
                                      </li>
                                      <li>
                                        Bottom:{" "}
                                        {parentBox.measurements.bottom ||
                                          "Not set"}
                                      </li>
                                      <li>
                                        Left:{" "}
                                        {parentBox.measurements.left ||
                                          "Not set"}
                                      </li>
                                    </ul>
                                  </div>
                                )}
                              </div>

                              {calculations && (
                                <div className="mt-4">
                                  <h5 className="text-sm font-medium text-green-700 mb-1">
                                    Calculated Differences
                                  </h5>
                                  <div className="bg-white p-3 rounded border border-green-200">
                                    <ul className="text-sm space-y-1">
                                      <li>Padding Top: {calculations.top}</li>
                                      <li>
                                        Padding Right: {calculations.right}
                                      </li>
                                      <li>
                                        Padding Bottom: {calculations.bottom}
                                      </li>
                                      <li>Padding Left: {calculations.left}</li>
                                    </ul>

                                    <div className="mt-3 pt-3 border-t border-green-100">
                                      <p className="text-xs text-green-700">
                                        CSS Equivalent:
                                      </p>
                                      <pre className="text-xs bg-gray-50 p-2 mt-1 rounded overflow-x-auto">
                                        {`padding: ${calculations.top} ${calculations.right} ${calculations.bottom} ${calculations.left};`}
                                      </pre>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {!parentBox && (
                                <p className="text-sm text-amber-600 mt-3">
                                  This is the outermost box, no parent box to
                                  calculate differences.
                                </p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  ) : (
                    <div className="text-green-600 text-center">
                      Click on a box in the list to see detailed calculations
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-gradient-to-r from-green-50 to-teal-50 p-4 flex justify-between items-center">
          <p className="text-green-700 text-sm">
            Measurements are automatically applied to code snippets
          </p>
          <Button
            onClick={resetBoxes}
            className="bg-green-600 hover:bg-green-700"
          >
            Reset All
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
