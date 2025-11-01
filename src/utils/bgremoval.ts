class BackgroundRemovalService {
  static async removeBackgroundWithEdges(imageUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new (window as any).Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas not supported"));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        try {
          const result = this.smartBackgroundRemoval(
            ctx,
            img.width,
            img.height
          );
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(URL.createObjectURL(blob));
            } else {
              reject(new Error("Failed to create image blob"));
            }
          }, "image/png");
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error("Failed to load image"));
    });
  }

  private static smartBackgroundRemoval(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ): void {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Step 1: Detect edges using Sobel operator
    const edges = this.detectEdges(data, width, height);

    // Step 2: Sample corner colors to guess background
    const cornerColors = this.getCornerColors(data, width, height);
    const backgroundColor = this.findMostCommonColor(cornerColors);

    // Step 3: Flood fill from corners with edge protection
    const visited = new Set<number>();
    const tolerance = 60;

    // Flood fill from all four corners
    const corners = [
      [0, 0],
      [width - 1, 0],
      [0, height - 1],
      [width - 1, height - 1],
    ];

    corners.forEach(([x, y]) => {
      this.floodFillWithEdgeProtection(
        data,
        edges,
        visited,
        x,
        y,
        width,
        height,
        backgroundColor,
        tolerance
      );
    });

    // Step 4: Apply transparency to filled areas
    for (let i = 0; i < data.length; i += 4) {
      const pixelIndex = i / 4;
      if (visited.has(pixelIndex)) {
        data[i + 3] = 0; // Make transparent
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  private static detectEdges(
    data: Uint8ClampedArray,
    width: number,
    height: number
  ): boolean[] {
    const edges = new Array(data.length / 4).fill(false);
    const sobelThreshold = 50;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = (y * width + x) * 4;

        // Sobel kernels
        const gx =
          -1 * this.getGray(data, x - 1, y - 1, width) +
          1 * this.getGray(data, x + 1, y - 1, width) +
          -2 * this.getGray(data, x - 1, y, width) +
          2 * this.getGray(data, x + 1, y, width) +
          -1 * this.getGray(data, x - 1, y + 1, width) +
          1 * this.getGray(data, x + 1, y + 1, width);

        const gy =
          -1 * this.getGray(data, x - 1, y - 1, width) -
          2 * this.getGray(data, x, y - 1, width) -
          1 * this.getGray(data, x + 1, y - 1, width) +
          1 * this.getGray(data, x - 1, y + 1, width) +
          2 * this.getGray(data, x, y + 1, width) +
          1 * this.getGray(data, x + 1, y + 1, width);

        const gradient = Math.sqrt(gx * gx + gy * gy);

        if (gradient > sobelThreshold) {
          edges[y * width + x] = true;
        }
      }
    }

    return edges;
  }

  private static getGray(
    data: Uint8ClampedArray,
    x: number,
    y: number,
    width: number
  ): number {
    const i = (y * width + x) * 4;
    return data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
  }

  private static getCornerColors(
    data: Uint8ClampedArray,
    width: number,
    height: number
  ): number[][] {
    const corners = [
      [0, 0],
      [width - 1, 0],
      [0, height - 1],
      [width - 1, height - 1],
      [Math.floor(width / 2), 0],
      [0, Math.floor(height / 2)],
    ];

    return corners.map(([x, y]) => {
      const i = (y * width + x) * 4;
      return [data[i], data[i + 1], data[i + 2]];
    });
  }

  private static findMostCommonColor(colors: number[][]): number[] {
    const avg = [0, 0, 0];
    colors.forEach((color) => {
      avg[0] += color[0];
      avg[1] += color[1];
      avg[2] += color[2];
    });

    return avg.map((val) => Math.floor(val / colors.length));
  }

  private static floodFillWithEdgeProtection(
    data: Uint8ClampedArray,
    edges: boolean[],
    visited: Set<number>,
    startX: number,
    startY: number,
    width: number,
    height: number,
    targetColor: number[],
    tolerance: number
  ): void {
    const stack = [[startX, startY]];

    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      const index = y * width + x;

      if (x < 0 || x >= width || y < 0 || y >= height || visited.has(index)) {
        continue;
      }

      const pixelIndex = index * 4;
      const currentColor = [
        data[pixelIndex],
        data[pixelIndex + 1],
        data[pixelIndex + 2],
      ];

      if (edges[index]) {
        continue;
      }

      if (this.isColorSimilar(currentColor, targetColor, tolerance)) {
        visited.add(index);

        stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
      }
    }
  }

  private static isColorSimilar(
    color1: number[],
    color2: number[],
    tolerance: number
  ): boolean {
    const dr = Math.abs(color1[0] - color2[0]);
    const dg = Math.abs(color1[1] - color2[1]);
    const db = Math.abs(color1[2] - color2[2]);

    return dr <= tolerance && dg <= tolerance && db <= tolerance;
  }

  static async removeBackgroundWithService(imageUrl: string): Promise<string> {
    return this.removeBackgroundWithEdges(imageUrl);
  }
}

export { BackgroundRemovalService };
