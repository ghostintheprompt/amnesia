/**
 * Amnesia Steganography Utility (s5)
 * ---------------------------------
 * Implements LSB (Least Significant Bit) payload embedding for 
 * stego-trojan simulation and detection.
 */

export class StegoEngine {
  /**
   * EMBED_PAYLOAD: s5 - Stego-Trojan
   * Embeds a bitstream into image pixel data.
   */
  public embed(pixelData: Uint8ClampedArray, payload: string) {
    const bitStream = this.toBitStream(payload);
    
    if (bitStream.length > pixelData.length) {
      throw new Error('Payload exceeds carrier capacity.');
    }

    for (let i = 0; i < bitStream.length; i++) {
      // Modify Least Significant Bit
      pixelData[i] = (pixelData[i] & 0xFE) | parseInt(bitStream[i]);
    }

    return pixelData;
  }

  /**
   * DETECT_SIGNATURE: INC-004 - STEGO_SIG_FOUND
   * Performs pixel-variance analysis to identify potential stego-payloads.
   */
  public detect(pixelData: Uint8ClampedArray): boolean {
    let varianceCount = 0;
    for (let i = 0; i < pixelData.length; i++) {
      if ((pixelData[i] & 1) === 1) varianceCount++;
    }
    
    // Simple heuristic for demo
    const density = varianceCount / pixelData.length;
    return density > 0.45 && density < 0.55; 
  }

  private toBitStream(str: string): string {
    return str.split('').map(char => 
      char.charCodeAt(0).toString(2).padStart(8, '0')
    ).join('');
  }
}
