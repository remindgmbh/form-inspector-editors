<?php

declare(strict_types=1);

use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;

defined('TYPO3') or die;

(function (): void {
    ExtensionManagementUtility::addTypoScript(
        'rmnd_form_inspector_editors',
        'setup',
        "@import 'EXT:rmnd_form_inspector_editors/Configuration/TypoScript/setup.typoscript'"
    );
})();
