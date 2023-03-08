<p align="center">
  <a href="https://rudderstack.com/">
    <img src="https://user-images.githubusercontent.com/59817155/121357083-1c571300-c94f-11eb-8cc7-ce6df13855c9.png">
  </a>
</p>

<p align="center"><b>The Customer Data Platform for Developers</b></p>

<p align="center">
  <b>
    <a href="https://rudderstack.com">Website</a>
    ·
    <a href="">Documentation</a>
    ·
    <a href="https://rudderstack.com/join-rudderstack-slack-community">Community Slack</a>
  </b>
</p>

---

# rudder-workflow-engine
In transformer service, we are doing data transformation from customer events to destination events, and we can organize the transformation process into logically separated steps for better understanding and maintainability.
## Overview
**Some of the steps of transformation:** 
- Validation
    - Event validation
    - Destination config validation
- Source to destination data mapping
- Enriching data with destination API calls
- Handling different types of events
    - Track, Identify, Page, etc.
    - Custom categories:
        - Product Viewed
        - Product Purchased
- Multiplexing
- Batching
- Response building.

Currently, most steps are implemented using Javascript code, which provides the most flexibility. Still, it is getting difficult to maintain, understand, debug, test, and develop in a standardized way. To bring standardization, we are building a workflow engine that is config driven to provide improved readability, testability, reusability, and speed of development.

Since we want to express the transformation of the logic using easy to read and write template based language. We support following template languages: 
* [JSONata](https://github.com/jsonata-js/jsonata)
* [JsonTemplate](https://github.com/rudderlabs/rudder-json-template-engine).
*  Easily extendable to [more template languages](https://github.com/rudderlabs/rudder-workflow-engine/tree/main/src/steps/base/simple/executors/template).
**Workflow Example using Jsonata:**
```yaml
templateType: Jsonata
steps:
  - name: unsupported
    condition: $not(op in ["+", "-", "*", "/"])
    template: |
      $doThrow("unsupported operation")
  - name: add
    description: Do addition
    condition: op = "+"
    template: |
      ( a + b )
  - name: subtract
    description: Do subtraction
    condition: op = "-"
    template: |
      ( a - b )
  - name: multiply
    description: Do multiplication
    condition: op = "*"
    template: |
      ( a * b )
  - name: divide
    description: Do division
    condition: op = "/"
    template: |
      ( 
        $assert( b != 0, "division by zero is not allowed");
        a / b 
      )
```
## Getting started
* `npm install rudder-workflow-engine`
```js
const workflowEngine = WorkflowEngineFactory.createFromFilePath("workflow.yaml", options);
workflowEngine.execute(input);

```

## Features
### Config Driven
Users should be able to express the destination transformation logic as a series of steps in a YAML file as a workflow. Steps can be written as template base languages.

### Bindings
Supports importing of external functions and data using bindings.
#### Workflow Bindings
- Bindings are similar to imports, which allow importing of externally defined functions and data to the workflow.
- **Types**
  - Type 1: Import a specific field from a file.
      ```yaml
      name: EventType 
      path: ./config
      ```
      - **EvenType** is defined in **./config** file then it will be imported as **$EventType**
  - Type 2: Import everything from a file as something.
      ```yaml
      name: MappingData 
      path: ./mapping
      exportAll: true
      ```
      - Everything from **./mapping** file will be imported to the variable **MappingData**
      - If **something1** and **something2** are defined in **./mapping** then we need to access them using **$MappingData.something1** and **$MappingData.something2**
  - Type 3: Import everything as it is defined in the file
      ```yaml
      path: ./utils
      ```
      - Everything from **./utils** file will be imported with the same names.
      - If **something1** and **something2** are defined in **./utils** then we need to access them using **$something1** and **$something2**
- Full example:
  ```yaml
  bindings:
    - name: EventType 
      path: ./config
    - name: MappingData 
      path: ./mapping
      exportAll: true
    - path: ./utils 
  ```
- These are user-specified bindings while defining the workflow.
#### Platform bindings
- The platform provides these bindings, which can be used directly without defining them in the **bindings** block.
- We will soon release detailed documentation on these bindings.
#### Execution bindings
- **$outputs:** Provides access to the outputs of the previous steps executed before the current step.
  ```yaml
  steps:
    - name: step1
      template: |
        {
          "a": something
        }
    - name: step2
      template: |
      {
        "b": $doSomething($outputs.step1.a)
      }
  ```
  - **Step2** uses the output of **step1.**
  - Workflow Engine automatically bindings step outputs to the **$outputs** variable.
- **$setContext:** It is a function to store any data in $context and use it later. **$outputs** are read-only variables for users to refer to the previous step outputs, so we can’t use them to pass a modifiable result. So if we want to update the same variable in multiple steps, then **$setContext** should be used.
  - Example:
    ```yaml
    steps:
      - name: setAForCase1
        condition: $isCase1(message)
        template: |
          $setContext("a", something1)
      - name: setAForCase2
        condition: $isCase2(message)
        template: |
          $setContext("a", something2)
      - name: updateA
        template: |
          $setContext("a", $updateA($context.a))
      - name: useA
        template: |
          $doSomething($context.a)
    ```
      - In this example, we update the variable repeatedly in several steps, so it is impossible to use **$outputs.**
      - A practical scenario for this feature is: that we want to populate an object differently based on some conditions and later use it.
  - **$context:** To access variables set using **$setContext** function. Please refer to the above example for clarity.
### Steps
  - Steps are the main execution blocks of the workflow.
  - Steps must contain a **name** to track outputs.
  - Steps can contain an optional **description** field to describe the details.
  - The step can contain an optional **condition** field to execute only if the condition is satisfied.
  - The step can contain an optional **inputTemplate** field to customize the input, which will be passed while executing the step.
  - There are two different types of steps supported:
      - SimpleStep
      - WorkflowStep
### Conditions
- A step in a workflow can mention an optional condition so that it gets executed only when the condition is satisfied.
- Condition is also a [Jsonata](https://docs.jsonata.org/overview.html) code.
    
    ```yaml
    steps:
      - name: commonValidation
        template: |
          ( common validations for events )
      - name: ValidateInputOfTrackEvent
        **condition: message.type = EventType.Track**
        template: |
          ( some validations specific to track events)
    ```
    
### InputTemplate**
- By default, all steps receive the same input as the workflow input, but when we want to modify the input before executing the step, we can use this feature.
  ```yaml
  steps:
    - name: step1
      (some logic ...)
    - name: step2
      inputTemplate: |
        (customize the input)
    - name: step3
      (some logic ...)
  ```
  - In the above example: step1 and step3 will be executed with the workflow’s input, but the step2 receives custom input as defined in the **inputTemplate**
### ContextTemplate
- By default, all steps receive the current context, but we can use this feature when we want to modify the context before executing the step. This is useful when using external workflows, workflow steps, or template paths.
  ```yaml
  steps:
    - name: step1
      (some logic to prepareContext)
    - name: step2
      contextTemplate: |
        (customize the context for step2)
      (some logic ...)
    - name: step3
      (some logic ...)
  ```
  - In the above example: step 3 will execute with the context prepared in step 1, but step 2 receives custom context as defined in the **contextTemplate.**
### LoopOverInput
- We can use this feature when the input is an array, and we want to execute the step logic for each element independently.
- This is mainly used for batch processing, and we report failed and successful executions without failing the step if an error occurs while processing a particular step.
  ```yaml
  name: executeForEach
  loopOverInput: true
  template: |
    ( do something )
  ```
  - If the input for the step is [e1, e2, e3], then the step will be executed for all elements independently, and imagine that it failed for e1 and succeeded for e2 and e3 then, the overall step output will be the following:
    ```json
    [
      {
        "error": someErrorForE1
      },
      {
        "output": someOutputForE2
      },
      {
        "output": someOutputForE3
      }
    ]
    ```

### OnComplete
- When the step is completed, the next step will be executed, but if we want to exit the workflow with the output of a particular step, then we can use this.
- This feature should be used only in a conditional step.
- Example 1: Avoid reprocessing, so return without modifying the input message.
  ```yaml
    steps:
      - name: checkIfProcessed
        condition: message.processed = true
        template: |
          message
        **onComplete: return**
      - name: processMessage
        template: |
          (...)
  ```
  - In the above example, we don’t want to reprocess messages, so we need to return them immediately if they are already processed.
- Example 2: Return early after processing the input message.
  ```yaml
  steps:
    - name: step1
      template: |
        (doSomeProcessing)
    - name: **step2**
      condition: someCondition
      template: |
        (doSomeProcessing)
      **onComplete: return**
    - name: step3
      template: |
        (doSomeProcessing)
  ```
  
  - In this example, we want to **return early** after successfully processing the message in **step2** since this step is conditional, and if the condition is not satisfied, then **step3** will be executed.
### OnError
- By default, if any step fails, then the entire workflow fails but if the step uses **OnError: continue** setting, then the workflow will ignore the error and continue with execution.
  ```yaml
  steps:
    - name: step1
      template: |
        (doSomeProcessing)
    - name: **step2**
      template: |
        (doSomeProcessing)
      **onError: continue**
    - name: step3
      template: |
        (doSomeProcessing)
  ```
  - In the above example, if any error occurs in either step1 or step3, the workflow will exit immediately, but when step2 fails, the workflow ignores the error and continues to execute step3.

## Steps
### Simple Step
- Simple step is the basic unit of execution in the workflow.
- A simple step can be a **function** that is defined in the **Bindings**.
  ```yaml
  bindings:
    - name: **processTrackEvent
      path: ./transform # actual file name is transform.js**
  steps:
    - name: processTrackEvent
      **functionName: processTrackEvent**
  ```
  
  - We can omit **.js** extension while defining the bindings.
  - **processTrackEvent** must have the following definition.
  
  ```tsx
  (input: any, bindings: Record<string, any>) => { 
    error?: any, 
    output?: any 
  }
  ```
- A simple step can be a JSONata template.
  ```yaml
  name: processTrackEvent
  **template: |
    (JSONata template to process track events)**
  ```
  - The template also can be imported from the file path.
    ```jsx
    name: processTrackEvent
    **templatePath: ./trackTemplate.yaml**
    ```
- We can use an **external workflow** in a simple step.
  ```yaml
  steps:
    - name: prepareContext
      template: $setContext("batchMode", true)
    - name: transform
      **externalWorkflow:
        path: ./pinterest_tag_single_workflow.yaml**
      loopOverInput: true
  ```
  - We are reusing the single event workflow in the batch events transformation workflow.
  - The **external workflow** will be executed as a black box, so we can only access the final output of the workflow but not the individual outputs of steps.
  - The external workflow is executed with **step input** and **context** of the original workflow.
  - The context of the parent workflow is passed to the child workflow (**externalWorkflow**) but not vice-versa. This is helpful to customize the child workflow execution based on where it is used.
  - The **external workflow** doesn’t have access to the parent workflow **outputs.**
### Workflow Step
- Series of **simple** steps.
    ```yaml
    steps:
      - name: category
        template: |
          (compute category)
      - name: ecom
        condition: $outputs.category = "ecom"
        steps:
          - name: validateInput
            description: Common validation for all ECom pages
            template: |
              (assert everything is fine)
          - name: page
            template: |
              (compute page using $outputs.category)
          - name: processSearchPage
            condition: $outputs.ecom.page = "search"
            template: |
              (search page template)
          - name: processDetailPage
            condition: $outputs.ecom.page = "detail"
            template: |
              (detail page template)
          - name: processCartPage
            condition: $outputs.ecom.page = "cart"
            template: |
              (cart page template)
    ```
    - We can access **outputs** of previous steps normally like **$outputs.category.**
    - To access outputs of the child steps of the workflowStep, we need to use **$outputs.workflowStepName.childStepName**, for example: $outputs.ecom.page.
        - The outputs of the child steps are not available outside the workflow step.
        - The last successfully executed child step’s output will become the output of the workflow step, and we can only access that outside the workflow step as **$output**.**workflowStepName,** for example, $output.ecom.
    - Currently, we don’t support nested workflow steps.
- Workflow Step can be imported from a file.
    
    ```yaml
    steps:
      - name: processECommerace
        **workflowStepPath: ./ecomWorkflow.yaml**
    ```
    
- Supports additional **Bindings**
    
    ```yaml
    bindings:
      - name: commonBinding
        path: ./bindings
    steps:
      - name: processECommerace
        bindings:
          - name: stepBinding
            path: ./workflow_step_bindings
        steps:
          - name: validateInput
            description: Common validation for all ECom pages
            template: |
              (assert with $commonBinding)
          - name: page
            template: |
              (compute page using $workflowBinding)
          - name: processSearchPage
            condition: $outputs.ecom.page = "search"
            template: |
              (search page template)
    ```
    
    - In the above example: **processECommerace** step is the workflow step and importing additional bindings. Both workflow’s (**commonBinding**) and step’s (**stepBinding**) bindings are available to the workflow step.

## Testing

#### Test Scenarios using Jest
* `npm run jest:scenarios --  --scenarios=<comma separate scenarios>`
* Example: `npm run jest:scenarios --  --scenarios=basic_workflow,to_array`

#### Manually Test Scenario
* `npm run test:scenario -- -s <scenario_folder>  -i <test_case_index_from_data.json>`
* Example: `npm run test:scenario -- -s outputs -i 1`
* Note: It just run the test case and produces results but won't run any validations of the results.

## Contribute

We would love to see you contribute to RudderStack. Get more information on how to contribute [**here**](CONTRIBUTING.md).

## License

The RudderStack `rudder-workflow-engine` is released under the [**MIT License**](https://opensource.org/licenses/MIT).
