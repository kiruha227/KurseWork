const SMALL_BOX_NUMBER = [1,2,3,4,5,6,7,8,9]
const SMALL_BOX_N = 3
const N = 9

let count_of_filled_cell = 0

class Sudoku_Field
{
    constructor(remove_count){this.remove_count = remove_count}
    
    generate_field()
    {
        return new Array(9).fill().map(() => new Array(9).fill(null))
    }

    //https://habr.com/ru/articles/192102/

    // Меняем порядок строк в сегментах
    change_random_rows(field_1, count)
    {
        var field = field_1.slice()

        let s_row_i=0, f_row_i=0, multi=0

        for (let i = 0; i < count; i++)
        {    
            multi = Math.floor(Math.random() * (SMALL_BOX_N))

            f_row_i = SMALL_BOX_N * multi + Math.floor(Math.random() * SMALL_BOX_N)
            
            s_row_i = SMALL_BOX_N * multi + Math.floor(Math.random() * SMALL_BOX_N)

            var t_f = field[f_row_i]
            var t_s = field[s_row_i]

            field[f_row_i] = t_s
            field[s_row_i] = t_f
        }

        return field
    }

    // Меняем порядок столбцов в сегментах
    change_random_column(field_1, count)
    {
        var field = field_1.slice()

        let s_column_i=0, f_column_i=0, multi=0

        for (let i = 0; i < count; i++)
        {    
            multi = Math.floor(Math.random() * (SMALL_BOX_N))

            f_column_i = SMALL_BOX_N * multi + Math.floor(Math.random() * SMALL_BOX_N)
            
            s_column_i = SMALL_BOX_N * multi + Math.floor(Math.random() * SMALL_BOX_N)

            for (let j = 0; j < N; j++) {
                [field[j][f_column_i], field[j][s_column_i]] = [field[j][s_column_i], field[j][f_column_i]]
                
            }
        }

        return field
    }

    // Удаляем значения в случайных ячейках
    remove_random_cells(field_1, count)
    {   
        if(count>81) return
        
        let i, j
        var field = field_1.slice()
        for (let index = 0; index < count; index++)
        {
            do
            {
                i = Math.floor(Math.random() * N)
            
                j = Math.floor(Math.random() * N)
            }
            while(field[i][j] === null)

            field[i][j] = null
        }
        return field
    }

    put_number_on_field(field_1)
    {
        // массив в параметрах функции передатся как ссылка!!!!!
        // поэтому мы создаём ещё одну переменную, в которую записываем копию массива (так ссылка не передаётся)
        var field = field_1.slice()

        var numbers = SMALL_BOX_NUMBER

        let temp_numbers = []
        for (let i = 0; i < N; i++) 
        {
            for (let j = 0; j < N; j++)
            {
                field[i][j] = numbers[j]

                // Сдвиг масива влево на 3 элемента
                temp_numbers.push(numbers[((j)+SMALL_BOX_N)%N])
            }

            if((i+1)%SMALL_BOX_N === 0) // Когда сегмент заканчивается мы сдвигаем изначальный 
                              // массив на один вслево
            {
                numbers = temp_numbers.slice()
                temp_numbers = []
                for (let j = 0; j < N; j++)
                {
                    temp_numbers.push(numbers[((j)+1)%N])
                }
                numbers = temp_numbers.slice()
            }
            else
            {
                numbers = temp_numbers.slice()
            }
            temp_numbers = []
        }
        return field
    }
    main()
    {
        var field = this.generate_field()
        
        field = this.put_number_on_field(field)
        
        field = this.change_random_column(field, 16)
        field = this.change_random_rows(field, 16)
        field = this.remove_random_cells(field, this.remove_count)

        // Количество заполненых ячеек
        count_of_filled_cell = N*N - this.remove_count

        return field
    }
}

class Sudoku_HTML
{   
    constructor(sudoku)
    {
        this.sudoku = sudoku
        this.field = sudoku.main()
    }
    tools = new Tools()
    
    cells
    selected_index
    selected_cell 

    get_cells()
    {
        this.cells = document.querySelectorAll('.cell')
        this.fill_cells(this.cells)
    }
    fill_cells(cells)
    {
        for (let i = 0; i < N*N; i++) 
        {
            const {row, column} = this.tools.get_index_from_row_to_matrix(i)

            if(this.field[row][column] !== null)
            {
                // Заполняем ячейки данными из матрицы и помечаем их как изначально заполненые (filled)
                cells[i].classList.add('filled')
                cells[i].innerHTML = this.field[row][column]
            }
        }
    }

    on_click_cell(cells, index)
    {
        // Удаляем все пометки, чтобы мы могли закрасить только одно поле
        for (let i = 0; i < N*N; i++)
        {
            cells[i].classList.remove('selected', 'error')
        }

        // Выбираем поле по нажати. ЛКМ
        // выбрать мы можем только не "изначально заполненные" ячейки
        if (cells[index].classList.contains('filled')) 
        {
            this.selected_index = null
            this.selected_cell = null
        }
        else
        {   
            // Помечаем класс
            cells[index].classList.add('selected')

            // запоминаем ячейку и её индекс
            this.selected_index = index
            this.selected_cell = cells[index]
        }
    }

    on_click_number(field, value)
    {
        // мы можем менять ячейку, если мы выбрали её и если она не изначально вставлена
        if(this.selected_cell === null || this.selected_cell.classList.contains('filled'))
            return

        // Убираем поле, которое показало ошибку вставки
        this.selected_cell.classList.remove('error')

        // Переводим индекс массива в индекс матрицы
        const {row, column} = this.tools.get_index_from_row_to_matrix(this.selected_index)

        // Смотрим, может ли игрок вставить число
        if(this.tools.is_can_put(field, value, row, column))
        {
            field[row][column] = value

            // проверяем пытается ли игрок вставить то же самое число
            if(parseInt(this.selected_cell.innerHTML) !== value)
                count_of_filled_cell++

            this.selected_cell.innerHTML = value
        }
        else
        {
            this.selected_cell.classList.add('error')
        }
        
        // Если количество заполненых ячеек совпадает с максимальным количеством ячеек, то судоку считается решённой
        if (count_of_filled_cell === N*N) {
            alert("Вы выиграли!!!! После нажатия ОК судоку перезапустится")
            location.reload()
            
        }
    }

    on_click_remove(field)
    {
        // мы можем менять ячейку, если мы выбрали её и если она не изначально вставлена
        if(this.selected_cell === null || this.selected_cell.classList.contains('filled'))
            return
        // Переводим индекс массива в индекс матрицы
        const {row, column} = this.tools.get_index_from_row_to_matrix(this.selected_index)

        //Если ячейка не пустая, то мы её очищаем
        if(this.selected_cell.innerHTML)
        {
            field[row][column] = null
            this.selected_cell.innerHTML = ''
            count_of_filled_cell--
        }
    }

    put_cell_event()
    {
        // Всем ячейкам добавляем событие нажатия
        for (let i = 0; i < N*N; i++)
        {
            this.cells[i].removeEventListener('click', () => this.on_click_cell(this.cells, i))
            this.cells[i].addEventListener('click', () => this.on_click_cell(this.cells, i))
        }
    }

    put_number_event()
    {
        // Сохраняем все кнопки класса number
        let number = document.querySelectorAll('.number')

        // Всем кнопкам с цифрами от 1 до 9 добавляем событие нажатия
        for (let i = 0; i < N; i++)
        {
            number[i].removeEventListener('click', () => this.on_click_number(this.field, parseInt(number[i].innerHTML)))
            number[i].addEventListener('click', () => this.on_click_number(this.field, parseInt(number[i].innerHTML)))
        }
    }

    put_remove_event()
    {
        // Кнопке удаления добавляем событие нажатия
        let remove = document.querySelector('.remove')
        
        remove.removeEventListener('click', () => this.on_click_remove(this.field))
        remove.addEventListener('click', () => this.on_click_remove(this.field))
    }

    start()
    {
        this.get_cells()

        this.put_cell_event()
        this.put_number_event()
        this.put_remove_event()
    }
}

class Tools
{
    constructor(){}

    is_can_put(field_1, cur_number, cur_index_row, cur_index_column)
    {
        var field = field_1.slice()

        // Для квадрата 3х3
        const left_up_corner_row = cur_index_row - cur_index_row % SMALL_BOX_N
        const left_up_corner_column = cur_index_column - cur_index_column % SMALL_BOX_N

        var flag = true

        for (let i = left_up_corner_row; i < left_up_corner_row + 3; i++) 
        {
            for (let j = left_up_corner_column; j < left_up_corner_column + 3; j++)
            {
                if (field[i][j] === cur_number && !(i == cur_index_row && j == cur_index_column))
                    return false
            }
        }

        // Для вертикали
        for (let j = 0; j < N; j++)
        {
            if (field[j][cur_index_column] === cur_number && j != cur_index_row)
                return false
        }

        // Для горизонтали
        for (let i = 0; i < N; i++)
        {
            if (field[cur_index_row][i] === cur_number && i != cur_index_column)
                return false
        }
        return true
    }

    get_index_from_row_to_matrix(index)
    {
        let row = Math.ceil((index+1) / N)-1
        let column = index % N
        return {row,column}
    }
}

let once_click = true
let SUDOKU

// Событие для кнопки, которая нажимается ровно один раз, если не были нажаты другие кнопки
// В противном случае кнопка будет некликабельна

// Событие для лёгкого уровня сложности
let easy = document.querySelector('.easy')
easy.addEventListener('click', () => 
{    
    if (once_click) {
        let FIELD = new Sudoku_Field(46)
        SUDOKU = new Sudoku_HTML(FIELD)
        SUDOKU.start()
        once_click = false
    }
}, {once: true})

// Событие для кнопки, которая нажимается ровно один раз, если не были нажаты другие кнопки
// В противном случае кнопка будет некликабельна

// Событие для нормального уровня сложности
let normal = document.querySelector('.normal')
normal.addEventListener('click', () => {
    if (once_click) {
        let FIELD = new Sudoku_Field(51)
        SUDOKU = new Sudoku_HTML(FIELD)
        SUDOKU.start()
        once_click = false
    }
}, {once: true})

// Событие для кнопки, которая нажимается ровно один раз, если не были нажаты другие кнопки
// В противном случае кнопка будет некликабельна

// Событие для сложного уровня сложности
let hard = document.querySelector('.hard')
hard.addEventListener('click', () => {
    if (once_click) {
        let FIELD = new Sudoku_Field(56)
        SUDOKU = new Sudoku_HTML(FIELD)
        SUDOKU.start()
        once_click = false
    }
}, {once: true})
