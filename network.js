class NeuralNetwork {
  // neuronCounts - num neurons each layer
  constructor(neuronCounts) {
    // store levels in an array
    this.levels = [];

    // neuronCounts.length gives the number of levels
    for (let i = 0; i < neuronCounts.length - 1; i++) {
      // set the number of neurons in each level

      this.levels.push(new Level(neuronCounts[i], neuronCounts[i + 1]));
    }
  }
  // Sets the inputs of each level as the outputs from the previous level
  // givenInputs - the initial sensor inputs
  static feedForward(givenInputs, network) {
    // Call feedForward on the first Level with initial inputs
    let outputs = Level.feedForward(givenInputs, network.levels[0]);

    // Call feedForward for the other levels in the network
    for (let i = 1; i < network.levels.length; i++) {
      outputs = Level.feedForward(outputs, network.levels[i]);
    }
    return outputs; // final outputs, eg left, right, forward, reverse
  }
}

class Level {
  constructor(inputCount, outputCount) {
    this.inputs = new Array(inputCount);
    this.outputs = new Array(outputCount);
    // bias = value above which a 'neron' will fire
    this.biases = new Array(outputCount);

    this.weights = [];
    for (let i = 0; i < inputCount; i++) {
      // for each input node, there are outputCount number of connections
      this.weights[i] = new Array(outputCount);
    }
    // For the simple network to function, biases and weights need to be set to some initial values
    Level.#randomize(this);
  }

  static #randomize(level) {
    for (let i = 0; i < level.inputs.length; i++) {
      for (let j = 0; j < level.outputs.length; j++) {
        level.weights[i][j] = Math.random() * 2 - 1; // between -1 and 1
      }
    }
    for (let i = 0; i < level.biases.length; i++) {
      level.biases[i] = Math.random() * 2 - 1;
    }
  }

  // initialize level inputs and calc outputs
  static feedForward(givenInputs, level) {
    // For each input of the level
    for (let i = 0; i < level.inputs.length; i++) {
      // set level inputs to the received inputs
      level.inputs[i] = givenInputs[i];
    }
    for (let i = 0; i < level.outputs.length; i++) {
      let sum = 0;
      for (let j = 0; j < level.inputs.length; j++) {
        sum += level.inputs[j] * level.weights[j][i];
      }
      if (sum > level.biases[i]) {
        level.outputs[i] = 1; // activate or fire the neuron
      } else {
        level.outputs[i] = 0; // deactivate/turn off the neuron
      }
    }
    return level.outputs;
  }
}
