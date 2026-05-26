"use client";

import { useState } from "react";

export default function MethodologyFooter() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <footer className="border-t border-border-rail pt-6 mt-8">
      <div className="flex items-center justify-between text-xs text-text-dim mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 hover:text-text-secondary transition-colors"
        >
          <span>METHODOLOGY</span>
          <span className="text-accent">{isExpanded ? "▲" : "▼"}</span>
        </button>

        <div className="flex items-center gap-4">
          <a
            href="https://arxiv.org/abs/2006.11239"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors"
          >
            DDPM Paper
          </a>
          <span className="text-border-rail">·</span>
          <span>PART OF: AI VISUALIZATION SUITE</span>
        </div>
      </div>

      {isExpanded && (
        <div className="border border-border-rail bg-bg-panel p-4 text-sm text-text-secondary space-y-4">
          <div>
            <h3 className="text-accent font-bold mb-2">Denoising Diffusion Probabilistic Models</h3>
            <p className="leading-relaxed">
              Diffusion models learn to reverse a gradual noising process. Starting from pure 
              Gaussian noise, the model iteratively predicts and removes noise to generate 
              coherent images. At each timestep t, the model estimates the noise component 
              ε<sub>θ</sub>(x<sub>t</sub>, t) and uses it to compute x<sub>t-1</sub>.
            </p>
          </div>

          <div>
            <h4 className="text-text-primary font-bold mb-1">Forward Process (Noising)</h4>
            <p className="leading-relaxed">
              q(x<sub>t</sub> | x<sub>0</sub>) = √ᾱ<sub>t</sub> · x<sub>0</sub> + √(1-ᾱ<sub>t</sub>) · ε, 
              where ε ~ N(0, I). As t increases, ᾱ<sub>t</sub> decreases, and the image becomes 
              progressively more noisy until it approaches pure Gaussian noise.
            </p>
          </div>

          <div>
            <h4 className="text-text-primary font-bold mb-1">Reverse Process (Denoising)</h4>
            <p className="leading-relaxed">
              The model learns p<sub>θ</sub>(x<sub>t-1</sub> | x<sub>t</sub>) by predicting the 
              noise at each step. The clean image estimate x̂<sub>0</sub> is computed as 
              (x<sub>t</sub> - √(1-ᾱ<sub>t</sub>) · ε<sub>θ</sub>) / √ᾱ<sub>t</sub>.
            </p>
          </div>

          <div>
            <h4 className="text-text-primary font-bold mb-1">Signal-to-Noise Ratio (SNR)</h4>
            <p className="leading-relaxed">
              SNR = ᾱ<sub>t</sub> / (1 - ᾱ<sub>t</sub>) measures how much signal remains 
              relative to noise at timestep t. High SNR (near t=0) means mostly signal; 
              low SNR (near t=T) means mostly noise. The model learns to denoise effectively 
              across the entire SNR range.
            </p>
          </div>
        </div>
      )}
    </footer>
  );
}
