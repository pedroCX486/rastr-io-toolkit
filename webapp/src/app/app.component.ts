import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ServerConnectionService } from '@shared/services/server-connection.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  // Para buscar via query params
  urlParams = new URLSearchParams(window.location.search);

  // Modal
  @ViewChild('adicionarNomeCodigoInput', { static: false }) adicionarNomeCodigoInput: ElementRef;
  @ViewChild('adicionarCodigoInput', { static: false }) adicionarCodigoInput: ElementRef;
  @ViewChild('editarCodigoInput', { static: false }) editarCodigoInput;

  @ViewChild('editarCodigoModal', { static: false }) editarCodigoRastreamentoModal: ModalDirective;
  @ViewChild('rastreamentoModal', { static: false }) rastreamentoModal: ModalDirective;
  public nomeCodigoFormModal: string;
  public codigoFormModal: string;
  public toggleAdicionar: boolean;
  public editarObjCodigoRastreamento: any;

  // Status Badge
  public apiStatus = '...';
  public tipoBadge = 'info';

  // UI Misc.
  public rastreamentoInput: string;
  public flagVisualizacao = true;
  public mensagem = { texto: '', objeto: '' };

  // Cód. Rastreamento
  public objetoRastreamento: any;
  public nomeObjetoRastreamento: string;
  public listaObjRastreamentos = [];

  constructor(private serverConnectionSvc: ServerConnectionService) { }

  ngOnInit(): void {
    this.checkAPIStatus();
    setTimeout(() => {
      this.checkAPIStatus();
    }, 2000);

    this.carregarDados();

    if (this.urlParams.get('codigo')) {
      this.rastrear(this.urlParams.get('codigo'));
    }
  }

  rastrear(codigoRastreamento?: any, modoRapido?: boolean): void {
    if (!modoRapido) {
      this.objetoRastreamento = null;

      if (typeof codigoRastreamento === 'object') {
        this.nomeObjetoRastreamento = codigoRastreamento.nome;
        codigoRastreamento = codigoRastreamento.codigo;
      } else {
        this.nomeObjetoRastreamento = null;
      }

      if (!this.validaCodigoRastreamento(codigoRastreamento)) {
        return;
      }

      codigoRastreamento = codigoRastreamento ? codigoRastreamento.trim() : '';

      setTimeout(() => {
        this.rastreamentoModal.show();
      }, 250);
    }

    if (!!codigoRastreamento && this.validaCodigoRastreamento(codigoRastreamento)) {
      this.mensagem = { texto: 'Consultando...', objeto: null };
      this.serverConnectionSvc.getRastreamento(codigoRastreamento).toPromise().then((data) => {
        this.mensagem = null;
        if (data.objeto[0].categoria.includes('ERRO')) {
          this.mensagem = { texto: data.objeto[0].categoria, objeto: data.objeto[0].numero };
        } else {
          this.objetoRastreamento = data.objeto[0];
        }
      }).catch(error => {
        this.mensagem = {
          texto: 'Erro ao consultar. O servidor dos Correios pode estar indisponível... ('
            + error.status + ' ' + error.statusText + ')', objeto: codigoRastreamento
        };
      }).finally(() => {
        if (this.listaObjRastreamentos.find(objetoRastreamento => objetoRastreamento.codigo === codigoRastreamento)) {
          this.listaObjRastreamentos.filter(objeto => objeto.codigo === codigoRastreamento).forEach(element => {
            element.rastreamento = this.mensagem ? this.mensagem.texto :
              this.objetoRastreamento.evento[0].descricao +
              (this.objetoRastreamento.evento[0].destino ? 'para ' + this.objetoRastreamento.evento[0].destino[0].local : '');
            this.salvarDados();
          });
        }
      });
    }
  }

  adicionarCodigoRastreamento(nome: string, codigo: string): void {
    if (!nome || !codigo) {
      alert('Preencha todos os campos antes de adicionar um código.');
      return;
    }
    if (!!nome && !!codigo && this.validaCodigoRastreamento(codigo)) {
      codigo = codigo.toUpperCase();
      this.listaObjRastreamentos.push({ nome, codigo, rastreamento: '' });
      this.rastrear(codigo, true);
      this.salvarDados();
      this.codigoFormModal = null;
      this.nomeCodigoFormModal = null;
      this.toggleAdicionar = false;
      this.rastreamentoInput = '';
    }
  }

  removerCodigoRastreamento(codigoRastreamentoObj: any): void {
    const question = confirm('Confirmar remoção do código ' + codigoRastreamentoObj.nome + '?');
    if (!question) {
      return;
    }

    if (!!codigoRastreamentoObj) {
      this.listaObjRastreamentos.splice(this.listaObjRastreamentos.indexOf(codigoRastreamentoObj), 1);
      this.salvarDados();
    }
  }

  editarCodigoRastreamento(objeto: string): void {
    this.editarObjCodigoRastreamento = objeto;
    this.editarCodigoRastreamentoModal.show();
  }

  finalizarEdicaoCodigoRastreamento(): void {
    if (!!this.editarObjCodigoRastreamento.nome && !!this.editarObjCodigoRastreamento.codigo
      && this.validaCodigoRastreamento(this.editarObjCodigoRastreamento.codigo)) {
      this.editarCodigoRastreamentoModal.hide();
      this.rastrear(this.editarObjCodigoRastreamento.codigo, true);
      this.salvarDados();
    }
  }

  validaCodigoRastreamento(codigo: string): boolean {
    if (!!codigo && codigo.match(/^[0-9a-zA-Z]+$/) && codigo.length === 13) {
      return true;
    } else {
      alert('Código inválido. Verifique e tente novamente.\r\nExemplo: AA123456789BB');
      return false;
    }
  }

  modoAdicionar(mostrar: boolean): void {
    if (mostrar) {
      this.toggleAdicionar = true;

      if (!!this.rastreamentoInput) {
        this.codigoFormModal = this.rastreamentoInput.toUpperCase();
      }

      setTimeout(() => {
        this.adicionarNomeCodigoInput.nativeElement.focus();
      }, 250);
    } else {
      this.toggleAdicionar = false;
    }
  }

  limpar(): void {
    this.rastreamentoInput = null;
    this.objetoRastreamento = null;
    this.flagVisualizacao = true;
    this.mensagem = null;
    this.nomeObjetoRastreamento = null;
    window.history.pushState({}, document.title, window.location.href.substring(0, window.location.href.lastIndexOf('/')));
  }

  // Sincronização
  carregarDados(): void {
    this.serverConnectionSvc.syncFromServer().toPromise().then((data) => {
      if (!!data && Object.keys(data).length) {
        this.listaObjRastreamentos = data;
        localStorage.setItem('listaObjetosRastreamento', JSON.stringify(this.listaObjRastreamentos));
      } else {
        if (!!localStorage.getItem('listaObjetosRastreamento')) {
          this.listaObjRastreamentos = JSON.parse(localStorage.getItem('listaObjetosRastreamento'));
        }
      }

      this.rastrearTudo();
    });
  }

  salvarDados(): void {
    this.serverConnectionSvc.syncToServer(this.listaObjRastreamentos).toPromise().then((data) => {
      localStorage.setItem('listaObjetosRastreamento', JSON.stringify(this.listaObjRastreamentos));
    });
  }

  // Utils
  toggleVisualizacao(): void {
    this.flagVisualizacao = this.flagVisualizacao ? false : true;
  }

  rastrearTudo(): void {
    if (this.listaObjRastreamentos.length) {
      this.listaObjRastreamentos.forEach(objeto => {
        this.rastrear(objeto.codigo, true);
      });
    }
  }

  checkAPIStatus(): void {
    this.apiStatus = 'Aguardando status da API...';

    this.serverConnectionSvc.getAPIStatus().toPromise().then((data) => {
      this.apiStatus = data.message;
      this.tipoBadge = 'success';
    }).catch(error => {
      this.apiStatus = 'Falha (' + error.status + ' ' + error.statusText + ')';
      this.tipoBadge = 'error';
    });
  }

}
