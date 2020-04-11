# Templates

Templates utilize the same Templating Engine that Blade uses.  This give you a lot of control over the code that you
are able to generate.  with simple if statements and foreach loops you can create very detailed standards that are easy
to maintain

## TemplateData

All the data that is available in the template can be accessed via the exposed $table variable.  If the generator requires
a database table, then there will be schema information exposed as well as all the the data that was gathered thew the 
data prompter stage of the generation.


### ModelTemplate

``` php
<?php echo '<?php' . PHP_EOL;
/** @var  TemplateData $table */
use Akceli\TemplateData;
?>

namespace <?=$table->namespace?>;

use \Illuminate\Database\Eloquent\Model;
<?php if ($table->hasField('deleted_at')): ?>
use Illuminate\Database\Eloquent\SoftDeletes;
<?php endif; ?>
use Carbon\Carbon;

/**
 * Class <?=$table->ModelName . PHP_EOL?>
 *
 * Database Fields
<?php foreach ($table->columns as $column): ?>
 * @property <?=$column->getColumnSetting('php_class_doc_type', 'string')?> $<?=$column->getField() . PHP_EOL?>
<?php endforeach; ?>
 *
 * Relationships
 *
 * @package App\Models
 */
class <?=$table->ModelName?> extends Model
{
<?php if ($table->hasField('deleted_at')): ?>
    use SoftDeletes;

<?php endif; ?>
    protected $table = '<?=$table->table_name?>';

<?php if ($table->missingField('updated_at') && ! $table->hasField('created_at')): ?>
    public $timestamps = false;
<?php endif; ?>
<?php if ($table->primaryKey !== 'id'): ?>
    public $incrementing = false;
    protected $primaryKey = '<?=$table->primaryKey?>';

<?php endif; ?>
    protected $casts = [
<?php foreach ($table->columns as $column): ?>
<?php if ($column->getColumnSetting('casts')): ?>
        '<?=$column->getField()?>' => '<?=$column->getColumnSetting('casts')?>',
<?php endif; ?>
<?php endforeach; ?>
    ];

    protected $fillable = [
<?php foreach ($table->columns as $column): ?>
        //'<?=$column->getField()?>',
<?php endforeach; ?>
    ];
}


`````

## ShortCodes

List of exposed Shortcodes.

For Database Table `user_names`

Accessing data via Shortcodes
* [[ModelName]] => UserName
* [[ModelNames]] => UserNames
* [[modelName]] => userName
* [[modelNames]] => userNames
* [[model_name]] => user_name
* [[model_names]] => user_names
* [[model-name]] => user-name
* [[model-names]] => user-names


Accessing data via the $table variable
* <?=$table->ModelName?> => UserName

* <?=$table->ModelNames?> => UserNames
* <?=$table->modelName?> => userName
* <?=$table->modelNames?> => userNames
* <?=$table->model_name?> => user_name
* <?=$table->model_names?> => user_names
* <?=$table->modelNameKabob?> => user-name
* <?=$table->modelNamesKabob?> => user-names

## TableData

In `akceli/` there is a AkceliTableDataTrait.php that is exposed for you to add any methods that you would like to the TableData

``` php
<?php

namespace Akceli;
use Akceli\Schema\ColumnInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * Class TemplateData
 * @package Akceli
 *
 * @property string $open_php_tag
 * @property string $modelName
 * @property string $modelNames
 * @property string $ModelName
 * @property string $ModelNames
 * @property string $model_name
 * @property string $model_names
 * @property string $modelNameKabob
 * @property string $modelNamesKabob
 *
 * @property string $table_name
 * @property string $primaryKey
 * @property array $extraData
 * @property Collection|ColumnInterface[] $columns
 */
class TemplateData
{
    use \AkceliTableDataTrait;   <-----------------  This is how you are able to add functionality to this class.

    private $extraData = [];
    private $columns;
    /**
     * @var array
     */
    private $data;

    /**
     * TemplateData constructor.
     * @param array $data
     * @param Collection|ColumnInterface[] $columns
     */
    public function __construct(array $data, Collection $columns)
    {
        $this->columns = $columns;
        foreach ($data as $key => $value) {
            $parser = new Parser();
            $parser->addData($this->toArray());

            $this->extraData[$key] = $parser->render($value);
        }
    }

    public static function buildModelAliases(string $model_name)
    {
        return [
            'ModelName' => Str::singular(Str::studly($model_name)),
            'ModelNames' => Str::plural(Str::studly($model_name)),
            'modelName' => Str::singular(Str::camel($model_name)),
            'modelNames' => Str::plural(Str::camel($model_name)),
            'model_name' => Str::singular(Str::snake($model_name)),
            'model_names' => Str::plural(Str::snake($model_name)),
            'model-name' => str_replace('_', '-', Str::singular(Str::snake($model_name))),
            'model-names' => str_replace('_', '-', Str::plural(Str::snake($model_name))),
            'modelNameKabob' => str_replace('_', '-', Str::singular(Str::snake($model_name))),
            'modelNamesKabob' => str_replace('_', '-', Str::plural(Str::snake($model_name))),
        ];
    }

    /**
     * @param $name
     * @return mixed|string
     */
    public function __get($name)
    {
        if ($name === 'columns') {
            return $this->columns;
        }

        if (isset($this->extraData[$name])) {
            return $this->extraData[$name];
        }

        return '';
    }

    /**
     * @param string $field_name
     * @return bool
     */
    public function hasField(string $field_name): bool
    {
        return $this->columns->contains(function (ColumnInterface $column) use ($field_name) {
            return $column->getField() === $field_name;
        });
    }

    /**
     * @param string $field_name
     * @return bool
     */
    public function missingField(string $field_name): bool
    {
        return !$this->hasField($field_name);
    }

    public function toArray()
    {
        $mainData = [
            'table' => $this,
        ];

        return array_merge($mainData, $this->extraData);
    }
}

```

## Columns Interface

In `akceli/` there is a AkceliColumnTrait.php that is exposed for you to add any methods that you would like to the Columns


``` php
<?php

namespace Akceli\Schema;

/**
 * Interface ColumnInterface
 * @package Akceli\Schema
 *
 * @mixin \AkceliColumnTrait   <------------------  This is just documentaiton but the data methods added to this trait will be availble on each column.
 */
interface ColumnInterface
{
    /**
     * Get the Column Name
     * 
     * @return string
     */
    public function getField(): string;

    /**
     * Check if the Column has any inherint Validation Rules
     * 
     * @return bool
     */
    public function hasValidationRules(): bool;

    /**
     * Get the validation base validation rules for a column
     * 
     * @return string
     */
    public function getValidationRulesAsString(): string;

    /**
     * @param string $column_setting
     * @param null $default
     * @return string|null
     */
    public function getColumnSetting(string $column_setting, $default = null);

    /**
     * Check if the Column is an Integer
     * 
     * @return bool
     */
    public function isInteger(): bool;

    /**
     * Check if the Column is a Boolean
     * 
     * @return bool
     */
    public function isBoolean(): bool;

    /**
     * Check if the Column is a Timestamp
     *
     * @return bool
     */
    public function isTimeStamp(): bool;

    /**
     * Check if the Column is an Enum
     *
     * @return bool
     */
    public function isEnum(): bool;

    /**
     * Check if the Column is a String
     *
     * @return bool
     */
    public function isString(): bool;
}


```

