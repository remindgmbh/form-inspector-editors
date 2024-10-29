import * as InspectorComponent from "@typo3/form/backend/form-editor/inspector-component.js";
import * as Helper from "@typo3/form/backend/form-editor/helper.js";

let _formEditorApp = null;

function getFormEditorApp() {
    return _formEditorApp;
}

function getPublisherSubscriber() {
    return getFormEditorApp().getPublisherSubscriber();
}

function getCurrentlySelectedFormElement() {
    return getFormEditorApp().getCurrentlySelectedFormElement();
}

function getFormElements() {
    return getFormEditorApp()
        .getNonCompositeNonToplevelFormElements()
        .map((element) => {
            const value = element.get("identifier");
            const label = `${element.get("label")} (${value})`.trimStart();
            return { label, value };
        });
}

function renderMultiSelectEditorFormElements(
    editorConfiguration,
    editorHtml,
    collectionElementIdentifier,
    collectionName
) {
    const elements = getFormElements();

    editorConfiguration["selectOptions"] = elements;
    InspectorComponent.renderMultiSelectEditor(
        editorConfiguration,
        editorHtml,
        collectionElementIdentifier,
        collectionName
    );

    const selectElement = Helper.getTemplatePropertyDomElement(
        "selectOptions",
        editorHtml
    );

    const propertyPath = getFormEditorApp().buildPropertyPath(
        editorConfiguration.propertyPath,
        collectionElementIdentifier,
        collectionName
    );

    const formElement = getCurrentlySelectedFormElement();

    const selectedValuesJson = formElement.get(propertyPath);

    if (selectedValuesJson) {
        const selectedValues = JSON.parse(selectedValuesJson);

        const selectedIndices = selectedValues.map((selectedValue) => {
            return elements.findIndex(
                (element) => element.value === selectedValue
            );
        });

        selectElement.val(selectedIndices);
    }

    // update values after element is removed
    getPublisherSubscriber().subscribe("view/formElement/removed", function () {
        const selectedValuesJson = formElement.get(propertyPath);
        if (selectedValuesJson) {
            const selectedValues = JSON.parse(selectedValuesJson);
            const elements = getFormElements();
            const newSelectedValues = selectedValues.filter((value) =>
                elements.some((element) => element.value === value)
            );
            formElement.set(propertyPath, JSON.stringify(newSelectedValues));
        }
    });

    selectElement.on("change", () => {
        const values = formElement.get(propertyPath);
        formElement.set(propertyPath, JSON.stringify(values));
    });
}

function _subscribeEvents() {
    /**
     * @private
     *
     * @param string
     * @param array
     *              args[0] = editorConfiguration
     *              args[1] = editorHtml
     *              args[2] = collectionElementIdentifier
     *              args[3] = collectionName
     * @return void
     */
    getPublisherSubscriber().subscribe(
        "view/inspector/editor/insert/perform",
        function (
            _topic,
            [
                editorConfiguration,
                editorHtml,
                collectionElementIdentifier,
                collectionName,
            ]
        ) {
            switch (editorConfiguration["templateName"]) {
                case "Inspector-FormElementsMultiSelectEditor":
                    renderMultiSelectEditorFormElements(
                        editorConfiguration,
                        editorHtml,
                        collectionElementIdentifier,
                        collectionName
                    );
                    break;
                case "Inspector-FormElementsPropertyGridEditor":
                    InspectorComponent.renderPropertyGridEditor(
                        editorConfiguration,
                        editorHtml,
                        collectionElementIdentifier,
                        collectionName
                    );
                    break
                default:
                    break;
            }
        }
    );
}

/**
 * @public
 *
 * @param object formEditorApp
 * @return void
 */
export function bootstrap(formEditorApp) {
    _formEditorApp = formEditorApp;
    _subscribeEvents();
}
