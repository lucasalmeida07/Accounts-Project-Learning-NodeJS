// módulos externos
import chalk from "chalk"
import inquirer from "inquirer"


// módulos internos

import fs from "fs"
import { get } from "https"

operation()

function operation() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Como posso lhe ajudar?',
            choices:[
                'Criar Conta',
                'Consultar Saldo',
                'Depositar',
                'Sacar',
                'Sair'
            ],
        }
    ])
    .then((answer) => {
        const action = answer['action']

        if(action === 'Criar Conta'){
            createAccount()
        }else if(action === 'Consultar Saldo') {
            checkBalance()
        }else if(action === 'Depositar') {
            deposit()
        }else if(action === 'Sacar') {
            withdraw()
        }else if(action === 'Sair'){
            console.log(chalk.bgBlue.black('Obrigado por usar o Accounts!'))
            process.exit()
        }

    })
    .catch((err) => console.log(err))

}
// ACTION FUNCTIONS

// Creat an account
function createAccount() {
    console.log(chalk.bgGreen.black('Parabéns por escolher o nosso banco'))
    console.log(chalk.green('Defina as opções da sua conta a seguir'))
    buildAccount()
}

function buildAccount() {
    inquirer.prompt([
        {
            name: 'accountName',
            message:'Digite um nome para sua conta: '
        }
    ]).then(answer => {
        const accountName = answer.accountName

        console.info(accountName)

        if(!fs.existsSync('accounts')) {
            fs.mkdirSync('accounts')
        }
        if(fs.existsSync(`accounts/${accountName}.json`)) {
            console.log(
                chalk.bgRed.black('Esta conta já existe'),
                )
            buildAccount()
            return
        }

        fs.writeFileSync(`accounts/${accountName}.json`, '{"balance": 0}', (err) =>{
            console.log(err)
        })

        console.log(chalk.green('Conta criada com sucesso!'))
        operation()
    }).catch(err => console.log(err))
}

// Add An Amount To User Account

function deposit() {

    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta? '
        }
    ]).then((answer) => {
        const accountName = answer.accountName

        //verify account name
        if(!checkAccount(accountName)) {
            return deposit()
        }

        inquirer.prompt([
            {
                name: 'amount',
                message: 'Quanto você deseja depositar? ',
            },
        ]).then((answer) => {
            const amount = answer.amount

            // add money
            addAmount(accountName,amount)
            operation()
        }).catch((err) => console.log(err))
    })
}

// Cheks Accounts Balance

function checkBalance(){
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta? ',
        }
    ]).then((answer) => {
        const accountName = answer['accountName']

        // verify account
        if(!checkAccount(accountName)){
            return checkBalance()
        }


        const accountBalance = getAccount(accountName).balance
        console.log(chalk.bgBlue.black(`Seu é balanço é de R$${accountBalance}`))
        operation()
    })
}

//Withdraws Money

function withdraw() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta? ',
        }
    ]).then((answer) => {
        const accountName = answer['accountName']
        
        if(!checkAccount(accountName)) {
            return withdraw()
        }
        
        inquirer.prompt([
            {
                name: 'amount',
                message: 'Qual a quantia que gostaria de sacar? ',
            }
        ]).then((answer) =>{
            const amount = parseFloat(answer['amount'])
            const accountData = getAccount(accountName)

            if(!amount){
                console.log('Erro, nenhuma quantgia inserida. Tente novamente.')
                return withdraw()
            }else if(amount === NaN){
                console.log('Erro, digite um número para sacar uma quantia.')
                return withdraw()
            }else if( accountData.balance < parseFloat(amount)){
                console.log('Erro, quantia inválida. Tente novamente.')
                return withdraw()
            }
            
            accountData.balance -= parseFloat(amount)

            fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData), (err) => {
                console.log(err)
            })
            console.log(chalk.bgGreen.black('Quantia sacada com sucesso!'))
            operation()


        }).catch(err => (console.log(err)))
    }).catch(err => (console.log(err)))
}

// HAND FUNCTIONS

// checks if an account exists
function checkAccount(accountName) {
    if(!fs.existsSync(`accounts/${accountName}.json`)){
        console.log(chalk.bgRed.black('Esta conta não existe'))
        return false
    }
    return true
}

// add money to an existing account
function addAmount(accountName, amount){
    const accountData = getAccount(accountName)

    if(!amount){
        console.log('Ocorreu um erro, tente novamente mais tarde!')
        return deposit()
    }

    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)
    
    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        (err) => {
            console.log(err)
        }
    )

    console.log(chalk.green(`Foi depositado o valor de R$${amount}`))
}

// get data from an existing account
function getAccount(accountName){
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf8',
        flag: 'r',
    })

    return JSON.parse(accountJSON)
}