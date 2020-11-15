import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  // Para buscar via query params.
  urlParams = new URLSearchParams(window.location.search);

  // Modal
  @ViewChild('adicionarNomeCodigoInput', { static: false }) adicionarNomeCodigoInput: ElementRef;
  @ViewChild('adicionarCodigoInput', { static: false }) adicionarCodigoInput: ElementRef;
  @ViewChild('editarCodigoInput', { static: false }) editarCodigoInput;

  @ViewChild('editarCodigoModal', { static: false }) editarCodigoModal: ModalDirective;
  @ViewChild('rastreamentoModal', { static: false }) rastreamentoModal: ModalDirective;
  nomeCodigoFormModal: string;
  codigoFormModal: string;
  modoAdicionar: boolean;
  editarObj: any;

  // Status Badge
  apiStatus = '...';
  tipoBadge = 'info';

  // UI Misc.
  rastreamentoInput: string;
  flagVisualizacao = true;
  mensagem = { texto: '', objeto: '' };

  // Cód. Rastreamento
  objeto: any;
  nomeObjeto: string;
  listaObjRastreamentos = [];

  constructor(private http: HttpClient) { }

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

  rastrear(codigo?: any, modoRapido?: boolean): void {
    if (!modoRapido) {
      this.objeto = null;

      if (typeof codigo === 'object') {
        this.nomeObjeto = codigo.nome;
        codigo = codigo.codigo;
      } else {
        this.nomeObjeto = null;
      }

      if (!this.validaCodigo(codigo)) {
        return;
      }

      codigo = codigo ? codigo.trim() : '';

      setTimeout(() => {
        this.rastreamentoModal.show();
      }, 250);
    }

    if (!!codigo && this.validaCodigo(codigo)) {
      this.mensagem = { texto: 'Consultando...', objeto: null };
      this.getRastreamento(codigo).toPromise().then((data) => {
        this.mensagem = null;
        if (data.objeto[0].categoria.includes('ERRO')) {
          this.mensagem = { texto: data.objeto[0].categoria, objeto: data.objeto[0].numero };
        } else {
          this.objeto = data.objeto[0];
        }
      }).catch(error => {
        this.mensagem = {
          texto: 'Erro ao consultar. O servidor dos Correios pode estar indisponível... ('
            + error.status + ' ' + error.statusText + ')', objeto: codigo
        };
      }).finally(() => {
        if (this.listaObjRastreamentos.find(objeto => objeto.codigo === codigo)) {
          this.listaObjRastreamentos.filter(objeto => objeto.codigo === codigo).forEach(element => {
            element.rastreamento = this.mensagem ? this.mensagem.texto :
              this.objeto.evento[0].descricao + (this.objeto.evento[0].destino ? 'para ' + this.objeto.evento[0].destino[0].local : '');
            this.salvarDados();
          });
        }
      });
    }
  }

  adicionarCodigo(nome: string, codigo: string): void {
    if (!nome || !codigo) {
      alert('Preencha todos os campos antes de adicionar um código.');
      return;
    }
    if (!!nome && !!codigo && this.validaCodigo(codigo)) {
      codigo = codigo.toUpperCase();
      this.listaObjRastreamentos.push({ nome, codigo, rastreamento: '' });
      this.rastrear(codigo, true);
      this.salvarDados();
      this.codigoFormModal = null;
      this.nomeCodigoFormModal = null;
      this.modoAdicionar = false;
      this.rastreamentoInput = '';
    }
  }

  removerCodigo(codigoObj: any): void {
    const question = confirm('Confirmar remoção do código ' + codigoObj.nome + '?');
    if (!question) {
      return;
    }

    if (!!codigoObj) {
      this.listaObjRastreamentos.splice(this.listaObjRastreamentos.indexOf(codigoObj), 1);
      this.salvarDados();
    }
  }

  editarCodigo(objeto: string): void {
    this.editarObj = objeto;
    this.editarCodigoModal.show();
  }

  finalizarEdicaoCodigo(): void {
    if (!!this.editarObj.nome && !!this.editarObj.codigo && this.validaCodigo(this.editarObj.codigo)) {
      this.editarCodigoModal.hide();
      this.rastrear(this.editarObj.codigo, true);
      this.salvarDados();
    }
  }

  validaCodigo(codigo: string): boolean {
    if (!!codigo && codigo.match(/^[0-9a-zA-Z]+$/) && codigo.length === 13) {
      return true;
    } else {
      alert('Código inválido. Verifique e tente novamente.\r\nExemplo: AA123456789BB');
      return false;
    }
  }

  toggleAdicionar(mostrar: boolean): void {
    if (mostrar) {
      this.modoAdicionar = true;

      if (!!this.rastreamentoInput) {
        this.codigoFormModal = this.rastreamentoInput.toUpperCase();
      }

      setTimeout(() => {
        this.adicionarNomeCodigoInput.nativeElement.focus();
      }, 250);
    } else {
      this.modoAdicionar = false;
    }
  }

  limpar(): void {
    this.rastreamentoInput = null;
    this.objeto = null;
    this.flagVisualizacao = true;
    this.mensagem = null;
    this.nomeObjeto = null;
    window.history.pushState({}, document.title, window.location.href.substring(0, window.location.href.lastIndexOf('/')));
  }

  carregarDados(): void {
    this.syncFromServer().toPromise().then((data) => {
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
    this.syncToServer(this.listaObjRastreamentos).toPromise().then((data) => {
      localStorage.setItem('listaObjetosRastreamento', JSON.stringify(this.listaObjRastreamentos));
    });
  }

  // Utils
  rastrearTudo(): void {
    if (this.listaObjRastreamentos.length) {
      this.listaObjRastreamentos.forEach(objeto => {
        this.rastrear(objeto.codigo, true);
      });
    }
  }

  toggleVisualizacao(): void {
    this.flagVisualizacao = this.flagVisualizacao ? false : true;
  }

  checkAPIStatus(): void {
    this.apiStatus = 'Aguardando status da API...';

    this.getAPIStatus().toPromise().then((data) => {
      this.apiStatus = data.message;
      this.tipoBadge = 'success';
    }).catch(error => {
      this.apiStatus = 'Falha (' + error.status + ' ' + error.statusText + ')';
      this.tipoBadge = 'error';
    });
  }

  getRastreamento(objeto: string): Observable<any> {
    return this.http.get('http://' + environment.apiUrl + ':' + environment.apiPort + '/rastrio/tracking=' + objeto);
  }

  getAPIStatus(): Observable<any> {
    return this.http.get('http://' + environment.apiUrl + ':' + environment.apiPort + '/');
  }

  syncFromServer(): Observable<any> {
    return this.http.get('http://' + environment.apiUrl + ':' + environment.apiPort + '/rastrio/syncFromServer');
  }

  syncToServer(listaObj: any): Observable<any> {
    return this.http.post('http://' + environment.apiUrl + ':' + environment.apiPort + '/rastrio/syncToServer', listaObj);
  }

}
