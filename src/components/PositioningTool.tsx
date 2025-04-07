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
  position?: {
    x: number;
    y: number;
  };
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

    // Calculate x and y positions
    const x = element.left;
    const y = element.top;

    // Generate different positioning code snippets
    return [
      // Absolute positioning with x and y
      `<div style="
  position: absolute;
  top: ${y};
  left: ${x};
  margin-top: ${element.top};
  margin-right: ${element.right};
  margin-bottom: ${element.bottom};
  margin-left: ${element.left};
"></div>`,

      // Flexbox with x and y
      `<div style="
  display: flex;
  position: relative;
  top: ${y};
  left: ${x};
  margin: ${element.top} ${element.right} ${element.bottom} ${element.left};
"></div>`,

      // Grid with x and y
      `<div style="
  display: grid;
  position: relative;
  top: ${y};
  left: ${x};
  margin: ${element.top} ${element.right} ${element.bottom} ${element.left};
"></div>`,

      // Margin-based with x and y
      `<div style="
  position: relative;
  top: ${y};
  left: ${x};
  margin: ${element.top} ${element.right} ${element.bottom} ${element.left};
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

  // Calculate margins and positions
  const calculatePositions = (
    childBox: Measurement,
    parentBox: Measurement,
  ) => {
    return {
      x: childBox.left ? parseInt(childBox.left) : 0,
      y: childBox.top ? parseInt(childBox.top) : 0,
      marginTop: childBox.top ? parseInt(childBox.top) : 0,
      marginRight: childBox.right ? parseInt(childBox.right) : 0,
      marginBottom: childBox.bottom ? parseInt(childBox.bottom) : 0,
      marginLeft: childBox.left ? parseInt(childBox.left) : 0,
    };
  };

  // Add a new box with current measurements
  const addBox = () => {
    const colors = [
      "border-blue-600 bg-white/40",
      "border-blue-500 bg-white/60",
      "border-blue-400 bg-white/80",
      "border-blue-300 bg-white",
    ];

    const position = {
      x: newBoxMeasurements.left ? parseInt(newBoxMeasurements.left) : 0,
      y: newBoxMeasurements.top ? parseInt(newBoxMeasurements.top) : 0,
    };

    const newBox: BoxData = {
      id: nextBoxId,
      measurements: { ...newBoxMeasurements },
      color: colors[Math.min(boxes.length, colors.length - 1)],
      position,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <Card className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-t-lg">
          <CardTitle className="text-2xl text-blue-800">
            Element Position & Margin Calculator
          </CardTitle>
          <CardDescription className="text-blue-700">
            Input measurements from Figma rulers and generate HTML/CSS code for
            positioning elements with x/y coordinates and margins.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          {/* Box Builder */}
          <div className="mb-8 p-4 border border-blue-200 rounded-md bg-blue-50">
            <h3 className="text-lg font-medium text-blue-700 mb-2">
              Box Builder
            </h3>
            <p className="text-blue-600 mb-4">
              Add boxes one at a time, with x/y coordinates and margins
            </p>

            {/* Box Measurements */}
            <div className="space-y-4 mb-4">
              <h4 className="text-md font-medium text-blue-700">
                New Box Measurements
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="box-top" className="text-blue-600">
                    Top (Y)
                  </Label>
                  <Input
                    id="box-top"
                    placeholder="e.g., 10px"
                    value={newBoxMeasurements.top}
                    onChange={(e) =>
                      handleBoxMeasurementChange("top", e.target.value)
                    }
                    className="border-blue-200 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="box-right" className="text-blue-600">
                    Right Margin
                  </Label>
                  <Input
                    id="box-right"
                    placeholder="e.g., 20px"
                    value={newBoxMeasurements.right}
                    onChange={(e) =>
                      handleBoxMeasurementChange("right", e.target.value)
                    }
                    className="border-blue-200 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="box-bottom" className="text-blue-600">
                    Bottom Margin
                  </Label>
                  <Input
                    id="box-bottom"
                    placeholder="e.g., 15px"
                    value={newBoxMeasurements.bottom}
                    onChange={(e) =>
                      handleBoxMeasurementChange("bottom", e.target.value)
                    }
                    className="border-blue-200 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="box-left" className="text-blue-600">
                    Left (X)
                  </Label>
                  <Input
                    id="box-left"
                    placeholder="e.g., 25px"
                    value={newBoxMeasurements.left}
                    onChange={(e) =>
                      handleBoxMeasurementChange("left", e.target.value)
                    }
                    className="border-blue-200 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <Button
                onClick={addBox}
                className="bg-blue-600 hover:bg-blue-700"
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
                className="border-blue-600 text-blue-700 hover:bg-blue-50"
              >
                Reset All Boxes
              </Button>
            </div>

            {/* Box Preview */}
            <div className="relative border-2 border-dashed border-blue-300 p-12 min-h-[400px] bg-white/90">
              {boxes.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-blue-600 opacity-70">
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
                        top: box.measurements.top || undefined,
                        left: box.measurements.left || undefined,
                        marginTop: box.measurements.top ? undefined : undefined,
                        marginRight: box.measurements.right
                          ? undefined
                          : undefined,
                        marginBottom: box.measurements.bottom
                          ? undefined
                          : undefined,
                        marginLeft: box.measurements.left
                          ? undefined
                          : undefined,
                        padding: "1rem",
                        border: "2px solid",
                        borderRadius: "0.25rem",
                        width: "fit-content",
                        minWidth: "180px",
                        minHeight: "100px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                      };

                      // Calculate x and y positions for display
                      const xPos = box.position?.x || 0;
                      const yPos = box.position?.y || 0;
                      const marginRight = box.measurements.right || "0px";
                      const marginBottom = box.measurements.bottom || "0px";
                      const marginLeft = box.measurements.left || "0px";
                      const marginTop = box.measurements.top || "0px";

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
                          {/* Box label with position */}
                          <div className="text-center font-medium">
                            Box {index + 1}
                            <div className="text-xs text-blue-600">
                              X: {xPos}px, Y: {yPos}px
                            </div>
                          </div>

                          {/* Margin indicators */}
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
                <h4 className="text-md font-medium text-blue-700 mb-2">
                  Added Boxes ({boxes.length})
                </h4>
                <div className="space-y-2">
                  {boxes.map((box, index) => (
                    <div
                      key={box.id}
                      className={`flex items-center justify-between p-2 rounded border ${selectedBoxId === box.id ? "bg-blue-100 border-blue-400" : "bg-white/80 border-blue-200"} cursor-pointer`}
                      onClick={() => setSelectedBoxId(box.id)}
                    >
                      <span className="font-medium text-blue-800">
                        Box {index + 1}
                      </span>
                      <div className="text-xs text-blue-600">
                        <span className="mr-2">
                          X: {box.position?.x || 0}px
                        </span>
                        <span className="mr-2">
                          Y: {box.position?.y || 0}px
                        </span>
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
                <h3 className="text-lg font-medium text-blue-700 mb-4">
                  Generated Code
                </h3>
                <Tabs defaultValue="absolute" className="w-full">
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger
                      value="absolute"
                      className="data-[state=active]:bg-blue-100"
                    >
                      Absolute
                    </TabsTrigger>
                    <TabsTrigger
                      value="flexbox"
                      className="data-[state=active]:bg-blue-100"
                    >
                      Flexbox
                    </TabsTrigger>
                    <TabsTrigger
                      value="grid"
                      className="data-[state=active]:bg-blue-100"
                    >
                      Grid
                    </TabsTrigger>
                    <TabsTrigger
                      value="margin"
                      className="data-[state=active]:bg-blue-100"
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
                        className="absolute top-2 right-2 bg-blue-50 hover:bg-blue-100 text-blue-700"
                        onClick={() => copyToClipboard(snippet, index)}
                      >
                        {copiedIndex === index ? "Copied!" : "Copy"}
                      </Button>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>

              {/* Box Position Details */}
              <div>
                <h3 className="text-lg font-medium text-blue-700 mb-4">
                  Box Position Details
                </h3>
                <div className="border-2 border-blue-200 rounded-md p-4 bg-white min-h-[300px] overflow-auto">
                  {boxes.length === 0 ? (
                    <div className="text-blue-600 opacity-70 text-center">
                      Add boxes to see position details
                    </div>
                  ) : selectedBoxId ? (
                    <div className="space-y-4">
                      {boxes.map((box, index) => {
                        if (box.id === selectedBoxId) {
                          return (
                            <div
                              key={box.id}
                              className="bg-blue-50 p-4 rounded-md"
                            >
                              <h4 className="font-medium text-blue-800 mb-2">
                                Box {index + 1} Position Details
                              </h4>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h5 className="text-sm font-medium text-blue-700 mb-1">
                                    Position Coordinates
                                  </h5>
                                  <ul className="text-sm space-y-1">
                                    <li>X: {box.position?.x || 0}px</li>
                                    <li>Y: {box.position?.y || 0}px</li>
                                  </ul>
                                </div>

                                <div>
                                  <h5 className="text-sm font-medium text-blue-700 mb-1">
                                    Margin Measurements
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
                              </div>

                              <div className="mt-4">
                                <h5 className="text-sm font-medium text-blue-700 mb-1">
                                  CSS Equivalent
                                </h5>
                                <div className="bg-white p-3 rounded border border-blue-200">
                                  <pre className="text-xs bg-gray-50 p-2 mt-1 rounded overflow-x-auto">
                                    {`position: relative;
top: ${box.measurements.top || "0"};
left: ${box.measurements.left || "0"};
margin: ${box.measurements.top || "0"} ${box.measurements.right || "0"} ${box.measurements.bottom || "0"} ${box.measurements.left || "0"};`}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  ) : (
                    <div className="text-blue-600 text-center">
                      Click on a box in the list to see detailed position
                      information
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 flex justify-between items-center">
          <p className="text-blue-700 text-sm">
            X/Y coordinates and margins are automatically applied to code
            snippets
          </p>
          <Button
            onClick={resetBoxes}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Reset All
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
