import { DeepDiveData, DepthLevel, FlashcardResponse, QuizResponse } from "./types";

// Curated knowledge base for popular topics + dynamic synthesizer for any custom topic
interface TopicData {
  intro: string;
  analogy: string;
  deep: string;
  simplified: string;
  example: string;
  quiz: QuizResponse;
  flashcards: FlashcardResponse;
  deepDive: (level: DepthLevel) => DeepDiveData;
}

const KNOWLEDGE_BASE: Record<string, TopicData> = {
  "machine learning": {
    intro: `Welcome to **Machine Learning (ML)**! At its core, machine learning is a paradigm shift in computing: instead of humans writing step-by-step algorithms, we write algorithms that **discover patterns from data**.\n\n### The Three Main Flavors:\n1. **Supervised Learning**: Learning with labeled examples (e.g. spam detection).\n2. **Unsupervised Learning**: Discovering hidden patterns without labels (e.g. customer clustering).\n3. **Reinforcement Learning**: Learning through trial and error with reward signals (e.g. game-playing agents).\n\nWhat aspect of machine learning are you most curious about — how algorithms learn, neural networks, or real-world applications?`,
    analogy: `Think of traditional programming like baking with a **strict recipe**: you measure flour, set the temperature, and follow every step exactly.\n\nMachine learning is like **learning to cook by tasting dishes**: you start by guessing, taste the sauce, notice it needs salt, adjust, and repeat thousands of times until your dish tastes delicious without needing an instruction manual.`,
    deep: `In mathematical terms, machine learning solves an **optimization problem over a parameterized function space**:\n\n$$\\min_{\\theta} \\frac{1}{N} \\sum_{i=1}^N \\mathcal{L}(f_\\theta(x_i), y_i) + \\lambda \\mathcal{R}(\\theta)$$\n\n1. **Loss Function ($\\mathcal{L}$)**: Quantifies discrepancy between prediction and ground truth (e.g. Cross-Entropy or Mean Squared Error).\n2. **Gradient Descent**: Updates parameters $\\theta \\leftarrow \\theta - \\alpha \\nabla_\\theta \\mathcal{L}$ using backpropagation via the chain rule.\n3. **Regularization ($\\mathcal{R}$)**: Penalizes model complexity (L1/L2) to prevent overfitting and guarantee generalization on unseen distributions.`,
    simplified: `Machine learning is simply teaching computers to recognize patterns from examples, just like a child learns what a dog looks like after seeing lots of pictures of dogs.`,
    example: `A classic example is **spam filtering**: the model scans millions of emails, learns that words like "free money" or "urgent prize" often correlate with spam, and calculates a probability score for each new email.`,
    quiz: {
      questions: [
        {
          question: "Which of the following best distinguishes machine learning from traditional software engineering?",
          options: [
            "ML models learn decision rules from data rather than having them hard-coded by programmers.",
            "ML systems always execute faster than traditional rules.",
            "ML can only run on specialized quantum computers.",
            "ML does not require mathematical calculations."
          ],
          correctIndex: 0,
          explanation: "In traditional programming, engineers write explicit logic. In ML, the algorithm iteratively adjusts weights to extract patterns directly from data."
        },
        {
          question: "What is 'overfitting' in machine learning?",
          options: [
            "When a model trains too slowly due to lack of RAM.",
            "When a model memorizes training noise and fails to generalize to new, unseen data.",
            "When the dataset contains too few features.",
            "When the learning rate is set to zero."
          ],
          correctIndex: 1,
          explanation: "Overfitting occurs when a model fits the training set too closely, capturing random noise rather than underlying patterns, degrading test performance."
        },
        {
          question: "Which type of machine learning uses reward and penalty feedback signals?",
          options: [
            "Supervised learning",
            "Unsupervised learning",
            "Reinforcement learning",
            "Dimensionality reduction"
          ],
          correctIndex: 2,
          explanation: "Reinforcement learning agents learn policies by interacting with an environment to maximize cumulative scalar rewards."
        },
        {
          question: "What is the primary function of gradient descent during model training?",
          options: [
            "To iteratively adjust parameters in the direction that minimizes the loss function.",
            "To eliminate duplicate records from the dataset.",
            "To convert continuous data into categorical bins.",
            "To encrypt neural network weights for privacy."
          ],
          correctIndex: 0,
          explanation: "Gradient descent computes the negative gradient of the loss with respect to parameters and takes step updates in that direction to find local minima."
        }
      ]
    },
    flashcards: {
      flashcards: [
        {
          front: "What is the core distinction between Supervised and Unsupervised Learning?",
          back: "Supervised learning trains on inputs paired with target labels (x, y). Unsupervised learning discovers latent structure directly from unlabeled inputs (x)."
        },
        {
          front: "What is Gradient Descent?",
          back: "An optimization algorithm that iteratively tunes model parameters in the direction of the steepest decrease of the loss function."
        },
        {
          front: "What is the Bias-Variance Tradeoff?",
          back: "High bias causes underfitting (too simplistic). High variance causes overfitting (sensitive to noise). Generalization requires balancing both."
        },
        {
          front: "What role does an Activation Function play in a Neural Network?",
          back: "It introduces non-linearity, enabling the network to learn complex non-linear boundaries rather than just linear combinations."
        },
        {
          front: "What is Regularization (e.g. L1 / L2)?",
          back: "Techniques that penalize overly large model weights during training to constrain model complexity and prevent overfitting."
        }
      ]
    },
    deepDive: (level: DepthLevel): DeepDiveData => ({
      topic: "Machine Learning",
      depthLevel: level,
      overview: "Machine Learning is the subfield of artificial intelligence dedicated to algorithms whose performance on a task improves automatically through statistical experience. Rather than computing deterministic decision trees, ML frames cognition as statistical pattern recognition across high-dimensional manifolds.",
      mentalModel: {
        title: "The Navigating Mountain Hiker (Loss Landscape)",
        description: "Imagine standing blindfolded on a foggy mountain ridge. Your goal is to reach the lowest valley (minimum error). You feel the slope beneath your feet (gradient) and take a step downhill. With thousands of steps, you reach the basin.",
        keyTakeaway: "Learning is finding the lowest point on an error surface by repeatedly stepping opposite the slope."
      },
      firstPrinciples: [
        {
          step: 1,
          principle: "Data as High-Dimensional Vectors",
          explanation: "Images, text, and sounds are represented as numerical matrices and coordinate vectors in embedding spaces where similarity corresponds to geometric distance."
        },
        {
          step: 2,
          principle: "Differentiable Objective Functions",
          explanation: "A mathematical loss function measures how far predictions deviate from ground truth, generating error signals with continuous derivatives."
        },
        {
          step: 3,
          principle: "Credit Assignment via Chain Rule",
          explanation: "Backpropagation uses the calculus chain rule to propagate error backwards through billions of interconnected parameters, computing exact partial derivatives."
        }
      ],
      misconceptions: [
        {
          myth: "Machine learning models 'think' and understand meaning like humans do.",
          reality: "Models compute statistical correlations and high-dimensional transformations. They do not possess subjective consciousness or real-world grounding."
        },
        {
          myth: "More data automatically fixes every machine learning problem.",
          reality: "Poor quality or biased data amplifies errors. Architecture inductive biases and distribution alignment are equally critical."
        }
      ],
      technicalNuances: [
        {
          aspect: "Vanishing & Exploding Gradients",
          details: "Deep networks suffer from gradients shrinking exponentially (vanishing) or growing wildly (exploding). Modern architectures solve this using Residual Connections (ResNets) and Layer Normalization."
        },
        {
          aspect: "Generalization Bounds & The Double Descent Curve",
          details: "Classic theory states overparameterization causes overfitting, but modern deep learning exhibits 'double descent': scaling parameters far beyond interpolation thresholds actually reduces generalization error."
        }
      ],
      connectedConcepts: [
        "Deep Learning & Neural Networks",
        "Gradient Descent & Optimizers",
        "Overfitting & Regularization",
        "Transformer Architectures"
      ],
      selfTestQuestion: {
        question: "Why can a model with 100% training accuracy still perform terribly in production?",
        hint: "Think about the difference between memorization and generalization.",
        answer: "The model has overfit: it memorized training set noise, quirks, and exact inputs rather than learning generalized latent features that persist across new unseen distributions."
      }
    })
  }
};

// Generic synthesizer for any topic when server is in static demo mode
export function synthesizeFallbackChat(topic: string, prompt: string, history: Array<{ role: string; content: string }>): string {
  const normTopic = topic.trim().toLowerCase();
  const known = KNOWLEDGE_BASE[normTopic];

  const lowerPrompt = prompt.toLowerCase();

  if (known) {
    if (lowerPrompt.includes("simpl")) return known.simplified;
    if (lowerPrompt.includes("analog")) return known.analogy;
    if (lowerPrompt.includes("deep") || lowerPrompt.includes("mechanic")) return known.deep;
    if (lowerPrompt.includes("example")) return known.example;
    if (history.length <= 1) return known.intro;
  }

  // Generic dynamic synthesizer for any custom topic
  if (lowerPrompt.includes("simpl")) {
    return `To put **${topic}** simply:\n\nImagine explaining it to a curious friend: at its core, it's about solving a specific challenge by breaking it into smaller, manageable parts that work together systematically.`;
  }
  if (lowerPrompt.includes("analog")) {
    return `Here is an intuitive analogy for **${topic}**:\n\nThink of it like an orchestra conductor: each instrument has its own role, rhythm, and purpose, but the real magic emerges when all components coordinate in harmony toward a unified goal.`;
  }
  if (lowerPrompt.includes("deep") || lowerPrompt.includes("mechanic")) {
    return `### Deep Mechanics of **${topic}**:\n\n1. **Foundational Constraint**: The governing laws and fundamental limits that define what is possible.\n2. **Internal Feedback Loops**: How changes in one variable cascade through interconnected systems.\n3. **Trade-offs**: Balancing efficiency against robustness and adaptability in dynamic environments.`;
  }
  if (lowerPrompt.includes("key point") || lowerPrompt.includes("takeaway")) {
    return `### Key Takeaways for **${topic}**:\n\n- **Core Principle**: Solves a fundamental problem through structured mechanisms.\n- **Primary Driver**: Governed by specific inputs and feedback loops.\n- **Practical Significance**: Essential for understanding modern systems and real-world applications.`;
  }
  if (lowerPrompt.includes("example")) {
    return `A concrete real-world example of **${topic}** is how modern engineers and researchers apply it daily to optimize performance, predict outcomes, and automate repetitive complexity.`;
  }

  return `Welcome to your exploration of **${topic}**!\n\nTo master this topic, we will focus on three key pillars:\n1. **The Core Intuition**: What problem does it fundamentally solve?\n2. **The Mechanics**: How do the underlying components interact?\n3. **Real-world Impact**: Where does it appear in practice?\n\nWhat specific angle would you like to investigate first?`;
}

export function synthesizeFallbackQuiz(topic: string): QuizResponse {
  const normTopic = topic.trim().toLowerCase();
  if (KNOWLEDGE_BASE[normTopic]?.quiz) {
    return KNOWLEDGE_BASE[normTopic].quiz;
  }

  return {
    questions: [
      {
        question: `What is the primary governing objective of ${topic}?`,
        options: [
          `To understand and optimize the core mechanisms that define ${topic}.`,
          `To eliminate all mathematical calculations.`,
          `To replace all empirical experimentation with guesswork.`,
          `To prevent any systematic analysis of the problem.`
        ],
        correctIndex: 0,
        explanation: `The essence of studying ${topic} is to identify its governing rules and optimize system performance.`
      },
      {
        question: `When analyzing ${topic}, which approach delivers the deepest understanding?`,
        options: [
          "Relying solely on surface-level definitions without testing.",
          "Breaking down concepts from first principles and testing edge cases.",
          "Ignoring the historical and empirical evidence.",
          "Assuming all inputs behave identically regardless of context."
        ],
        correctIndex: 1,
        explanation: "First-principles reasoning deconstructs complex topics into foundational truths before rebuilding conceptual understanding."
      },
      {
        question: `What is a common pitfall when first learning ${topic}?`,
        options: [
          "Confusing superficial correlation with true causal mechanisms.",
          "Asking too many clarifying questions.",
          "Using analogies to build initial intuition.",
          "Connecting theory with practical examples."
        ],
        correctIndex: 0,
        explanation: "Beginners often mistake surface symptoms or correlations for the underlying causal system."
      },
      {
        question: `How do practitioners evaluate success or accuracy in ${topic}?`,
        options: [
          "Through rigorous benchmarks, measurable outcomes, and reproducible tests.",
          "By relying on subjective opinion alone.",
          "By avoiding testing on unfamiliar datasets or scenarios.",
          "By assuming initial assumptions are always infallible."
        ],
        correctIndex: 0,
        explanation: "Objective evaluation requires systematic testing, validation metrics, and reproducibility under varying conditions."
      }
    ]
  };
}

export function synthesizeFallbackFlashcards(topic: string): FlashcardResponse {
  const normTopic = topic.trim().toLowerCase();
  if (KNOWLEDGE_BASE[normTopic]?.flashcards) {
    return KNOWLEDGE_BASE[normTopic].flashcards;
  }

  return {
    flashcards: [
      {
        front: `What is the core definition of ${topic}?`,
        back: `A structured discipline and conceptual framework designed to analyze, model, and solve problems within its domain.`
      },
      {
        front: `What is the central mechanism behind ${topic}?`,
        back: `Iterative feedback and systemic transformation converting raw inputs into actionable, predictable outputs.`
      },
      {
        front: `What is a prime real-world application of ${topic}?`,
        back: `Deploying foundational principles to automate, optimize, and improve decision-making in complex systems.`
      },
      {
        front: `What is the biggest challenge or constraint in ${topic}?`,
        back: `Balancing theoretical precision with real-world noise, constraints, and scalability.`
      },
      {
        front: `What mindset is most helpful when mastering ${topic}?`,
        back: `First-principles thinking: breaking down assumptions to fundamental truths and reasoning upward.`
      }
    ]
  };
}

export function synthesizeFallbackDeepDive(topic: string, depthLevel: DepthLevel = "Comprehensive"): DeepDiveData {
  const normTopic = topic.trim().toLowerCase();
  const entry = KNOWLEDGE_BASE[normTopic];
  if (entry) {
    return entry.deepDive(depthLevel);
  }

  return {
    topic,
    depthLevel,
    overview: `${topic} is a multidimensional subject with profound theoretical foundations and practical applications. At its foundation, it provides the structural blueprints and principles necessary to understand how complex systems operate, evolve, and adapt under real-world constraints.`,
    mentalModel: {
      title: "The Interconnected Gears (System Dynamics)",
      description: `Picture ${topic} as a precision timepiece: individual components appear simple in isolation, but their functional power emerges from how their rotational forces transfer momentum through the entire system.`,
      keyTakeaway: "Understanding requires observing how inputs transform across interconnected subsystems rather than isolating a single component."
    },
    firstPrinciples: [
      {
        step: 1,
        principle: "Foundational Invariants",
        explanation: `Identify the immutable baseline rules and physical or logical laws that govern ${topic}.`
      },
      {
        step: 2,
        principle: "Interactions & Signal Propagation",
        explanation: `How components exchange energy, data, or state changes within the environment.`
      },
      {
        step: 3,
        principle: "Emergent Equilibrium",
        explanation: `The higher-order stability and performance characteristics that arise when the system reaches steady state.`
      }
    ],
    misconceptions: [
      {
        myth: `That ${topic} operates as a black box without explainable causal mechanisms.`,
        reality: `Every behavior traces back to specific underlying equations, logic gates, or empirical rules.`
      },
      {
        myth: `That mastering ${topic} requires memorizing hundreds of disconnected facts.`,
        reality: `Mastering a small set of foundational first principles allows you to deduce the rest dynamically.`
      }
    ],
    technicalNuances: [
      {
        aspect: "Boundary Conditions & Edge Cases",
        details: `System stability degrades when inputs exceed standard operating tolerances, requiring safeguards and fallback states.`
      },
      {
        aspect: "Optimization Trade-offs",
        details: `Maximizing throughput or speed frequently introduces latency spikes or requires increased resource overhead.`
      }
    ],
    connectedConcepts: [
      `Foundations of ${topic}`,
      `Advanced Optimization`,
      `System Architecture`,
      `Practical Applications`
    ],
    selfTestQuestion: {
      question: `If the core constraint of ${topic} were removed, what emergent behavior would collapse first?`,
      hint: `Think about what keeps the system bounded and prevents runaway feedback loops.`,
      answer: `Without governing boundary constraints, the system would lose stability, resulting in unbounded variance and inability to predict outcomes.`
    }
  };
}
